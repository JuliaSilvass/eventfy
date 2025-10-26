document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-servico");
  const servicoID = document.getElementById("servico-id").value;
  const areaUpload = document.getElementById("area-upload");
  const inputArquivo = document.getElementById("input-arquivo");
  const previaImagensContainer = document.getElementById("previa-imagens");
  let arquivosSelecionados = [];

  areaUpload.addEventListener("click", () => inputArquivo.click());
  inputArquivo.addEventListener("change", (e) => handleFiles(e.target.files));

  function handleFiles(files) {
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        arquivosSelecionados.push(file);
        criarPrevia(file);
      }
    }
  }

  function criarPrevia(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement("div");
      div.className = "previa-item";
      const img = document.createElement("img");
      img.src = e.target.result;
      img.className = "previa-imagem";
      div.appendChild(img);
      previaImagensContainer.appendChild(div);
    };
    reader.readAsDataURL(file);
  }

  // Envio do formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nomeServico", document.getElementById("nome-servico").value);
    formData.append("categoria", document.getElementById("categoria").value);
    formData.append("preco", parseFloat(document.getElementById("preco").value));
    formData.append("descricao", document.getElementById("descricao").value);
    arquivosSelecionados.forEach(file => formData.append("imagens", file));

    try {
      const response = await fetch(`/servicos/editar/${servicoID}`, {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        alert("Serviço atualizado com sucesso!");
        window.location.href = "/servicos";
      } else {
        const msg = await response.text();
        alert(`Erro ao atualizar: ${msg}`);
      }
    } catch (err) {
      console.error("Erro ao enviar:", err);
      alert("Falha ao atualizar o serviço.");
    }
  });
});

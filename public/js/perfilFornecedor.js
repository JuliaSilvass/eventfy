document.addEventListener("DOMContentLoaded", () => {

  const btnAbrirModal = document.getElementById("btn-abrir-modal-descricao");
  const modalOverlay = document.getElementById("modal-descricao");

  if (!btnAbrirModal || !modalOverlay) return;

  const btnFecharModal = document.getElementById("modal-btn-fechar");
  const btnCancelarModal = document.getElementById("modal-btn-cancelar");
  const formModal = document.getElementById("form-modal-descricao");
  const textareaModal = document.getElementById("modal-textarea-descricao");
  const pDescricao = document.getElementById("descricao-sobre-nos");
  const erroModal = document.getElementById("modal-erro-msg");

  const abrirModal = () => {
    textareaModal.value = pDescricao.textContent.trim();
    erroModal.textContent = "";
    modalOverlay.classList.remove("hidden");
  };

  const fecharModal = () => {
    modalOverlay.classList.add("hidden");
  };

  const salvarDescricao = async (e) => {
    e.preventDefault();
    const novaDescricao = textareaModal.value;
    const btnSalvar = formModal.querySelector('button[type="submit"]');
    btnSalvar.textContent = "Salvando...";
    btnSalvar.disabled = true;

    try {
      const response = await fetch("/perfil/descricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sobreNos: novaDescricao })
      });

      if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro.erro || "Falha ao salvar");
      }

      const data = await response.json();

      pDescricao.textContent = data.novaDescricao;
      fecharModal();

    } catch (err) {
      console.error("Erro no fetch:", err);
      erroModal.textContent = err.message;
    } finally {
      btnSalvar.textContent = "Salvar";
      btnSalvar.disabled = false;
    }
  };

  btnAbrirModal.addEventListener("click", abrirModal);
  btnFecharModal.addEventListener("click", fecharModal);
  btnCancelarModal.addEventListener("click", fecharModal);
  formModal.addEventListener("submit", salvarDescricao);

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      fecharModal();
    }
  });
});
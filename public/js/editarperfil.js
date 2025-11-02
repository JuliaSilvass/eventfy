document.addEventListener("DOMContentLoaded", () => {
  const telefoneInput = document.getElementById("telefone");

  const aplicarMascaraTelefone = (e) => {
    let valorLimpo = e.target.value.replace(/\D/g, "");
    let valorFormatado = "";
    if (valorLimpo.length > 0) { valorFormatado = `(${valorLimpo.substring(0, 2)}`; }
    if (valorLimpo.length > 2) { valorFormatado += `) ${valorLimpo.substring(2, 7)}`; }
    if (valorLimpo.length > 7) { valorFormatado += `-${valorLimpo.substring(7, 11)}`; }
    e.target.value = valorFormatado;
  };

  aplicarMascaraTelefone({ target: telefoneInput });

  telefoneInput.addEventListener("input", aplicarMascaraTelefone);
});
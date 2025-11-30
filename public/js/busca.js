function aplicarBuscaGenerica(inputSelector, itemSelector, customField = null) {
  const input = document.querySelector(inputSelector);
  const items = document.querySelectorAll(itemSelector);

  if (!input || !items.length) return;

  input.addEventListener('input', () => {
    const termo = input.value.toLowerCase();

    items.forEach(item => {
      const texto = customField
        ? customField(item).toLowerCase()
        : item.innerText.toLowerCase();

      item.style.display = texto.includes(termo) ? "block" : "none";
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector("#campoBuscaEmpresas")) {
    aplicarBuscaGenerica(
      "#campoBuscaEmpresas",
      ".itemServico",
      item => item.querySelector(".nomeEmpresa").innerText
    );
  }

  if (document.querySelector("#campoBuscaServicos")) {
    aplicarBuscaGenerica(
      "#campoBuscaServicos",
      ".itemServico",
      item => item.querySelector("h3").innerText
    );
  }
  if (document.querySelector("#campoBuscaEventos")) {
    aplicarBuscaGenerica(
      "#campoBuscaEventos",
      ".itemServico",
      item => item.querySelector("h3").innerText
    );
  }
});
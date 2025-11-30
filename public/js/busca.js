window.inicializarBusca = function() {
  function aplicarBuscaGenerica(inputSelector, itemSelector, customField = null) {
    const input = document.querySelector(inputSelector);
    const items = document.querySelectorAll(itemSelector);

    if (!input || !items.length) return;

    const novoInput = input.cloneNode(true);
    input.parentNode.replaceChild(novoInput, input);

    novoInput.addEventListener('input', () => {
      const termo = novoInput.value.toLowerCase();

      items.forEach(item => {
        const texto = customField
          ? customField(item).toLowerCase()
          : item.innerText.toLowerCase();

        item.style.display = texto.includes(termo) ? "block" : "none";

        if (item.classList.contains('card-disponivel')) {
             item.style.display = texto.includes(termo) ? "flex" : "none";
        }
      });
    });
  }

  if (document.querySelector("#campoBuscaEmpresas")) {
    aplicarBuscaGenerica("#campoBuscaEmpresas", ".itemServico", item => item.querySelector(".nomeEmpresa").innerText);
  }

  if (document.querySelector("#campoBuscaServicos")) {
    aplicarBuscaGenerica("#campoBuscaServicos", ".itemServico", item => item.querySelector("h3")?.innerText || "");
  }

  if (document.querySelector("#campoBuscaEventos")) {
    aplicarBuscaGenerica("#campoBuscaEventos", ".itemServico", item => item.querySelector("h3")?.innerText || "");
  }

  if (document.querySelector("#campoBuscaSelecao")) {
     const input = document.querySelector("#campoBuscaSelecao");
     const items = document.querySelectorAll(".card-disponivel");
     
     if (input && items.length) {
       const novoInput = input.cloneNode(true);
       input.parentNode.replaceChild(novoInput, input);
       
       novoInput.addEventListener('input', () => {
         const termo = novoInput.value.toLowerCase();
         items.forEach(item => {
            const nome = item.querySelector("h4").innerText.toLowerCase();
            const empresa = item.querySelector(".disp-empresa").innerText.toLowerCase();
            if (nome.includes(termo) || empresa.includes(termo)) {
              item.style.display = "flex";
            } else {
              item.style.display = "none";
            }
         });
       });
     }
  }
};

document.addEventListener("DOMContentLoaded", window.inicializarBusca);
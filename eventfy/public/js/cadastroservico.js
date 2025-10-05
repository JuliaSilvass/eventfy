document.addEventListener("DOMContentLoaded", () => {
  const diasContainer = document.querySelector(".dias-semana");
  const horariosContainer = document.getElementById("container-horarios");

  const nomesDosDias = {
    dom: "Domingo", seg: "Segunda-feira", ter: "Terça-feira",
    qua: "Quarta-feira", qui: "Quinta-feira", sex: "Sexta-feira", sab: "Sábado"
  };

  function atualizarBotoes(blocoDoDia) {
    const todosIntervalos = blocoDoDia.querySelectorAll('.intervalo-tempo');
    todosIntervalos.forEach((intervalo, index) => {
      const btnAdicionar = intervalo.querySelector('.btn-adicionar-horario');
      if (btnAdicionar) {
        if (index === todosIntervalos.length - 1) {
          btnAdicionar.style.display = 'inline-block';
        } else {
          btnAdicionar.style.display = 'none';
        }
      }
    });
  }

  function criarIntervaloDeTempo() {
    const div = document.createElement("div");
    div.className = "intervalo-tempo";
    div.innerHTML = `
      <input type="time" name="inicio">
      <span>Até</span>
      <input type="time" name="fim">
      <div class="controles-intervalo">
        <button type="button" class="btn-adicionar-horario">+</button>
        <button type="button" class="btn-remover-horario">
          <img src="/assets/lixeira.svg" alt="Remover Horário">
        </button>
      </div>
    `;
    return div;
  }

  diasContainer.addEventListener("click", (e) => {
    if (!e.target.classList.contains("dia-bolinha")) return;
    const bolinhaDia = e.target;
    const diaAbreviado = bolinhaDia.dataset.dia;
    bolinhaDia.classList.toggle("ativo");
    const blocoExistente = horariosContainer.querySelector(`.bloco-horario-dia[data-dia="${diaAbreviado}"]`);
    if (bolinhaDia.classList.contains("ativo")) {
      if (!blocoExistente) {
        const novoBlocoHorario = document.createElement("div");
        novoBlocoHorario.className = "bloco-horario-dia";
        novoBlocoHorario.dataset.dia = diaAbreviado;
        const nomeCompletoDia = nomesDosDias[diaAbreviado];
        novoBlocoHorario.innerHTML = `<p class="bloco-horario-dia-titulo">${nomeCompletoDia}</p>`;
        novoBlocoHorario.appendChild(criarIntervaloDeTempo());
        horariosContainer.appendChild(novoBlocoHorario);
      }
    } else {
      if (blocoExistente) {
        blocoExistente.remove();
      }
    }
  });

  horariosContainer.addEventListener("click", (e) => {
    const botaoAdicionar = e.target.closest(".btn-adicionar-horario");
    const botaoRemover = e.target.closest(".btn-remover-horario");

    if (botaoAdicionar) {
      const blocoPai = botaoAdicionar.closest(".bloco-horario-dia");
      blocoPai.appendChild(criarIntervaloDeTempo());
      atualizarBotoes(blocoPai);
    }

    if (botaoRemover) {
      const intervaloParaRemover = botaoRemover.closest(".intervalo-tempo");
      const blocoDoDia = intervaloParaRemover.closest(".bloco-horario-dia");
      
      intervaloParaRemover.remove();

      if (blocoDoDia && document.body.contains(blocoDoDia)) {
        atualizarBotoes(blocoDoDia);
      } else {
        const diaAbreviado = blocoDoDia.dataset.dia;
        const bolinhaDia = document.querySelector(`.dia-bolinha[data-dia="${diaAbreviado}"]`);
        if (bolinhaDia) {
          bolinhaDia.classList.remove("ativo");
        }
      }
    }
  });
});
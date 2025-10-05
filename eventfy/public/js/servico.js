document.addEventListener("DOMContentLoaded", () => {
  const diasContainer = document.querySelector(".dias-semana");
  const horariosContainer = document.getElementById("container-horarios");

  const nomesDosDias = {
    dom: "Domingo", seg: "Segunda-feira", ter: "Terça-feira",
    qua: "Quarta-feira", qui: "Quinta-feira", sex: "Sexta-feira", sab: "Sábado"
  };

  function criarIntervaloDeTempo() {
    const div = document.createElement("div");
    div.className = "intervalo-tempo";
    div.innerHTML = `
      <input type="time" name="inicio">
      <span>Até</span>
      <input type="time" name="fim">
      <button type="button" class="btn-adicionar-horario">+</button>
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
    if (e.target.classList.contains("btn-adicionar-horario")) {
      const blocoPai = e.target.closest(".bloco-horario-dia");
      blocoPai.appendChild(criarIntervaloDeTempo());
      e.target.remove();
    }
  });
});
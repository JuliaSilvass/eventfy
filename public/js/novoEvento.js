document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formNovoEvento");

  if (form) {
    const setErro = (idCampo, mensagem) => {
      const span = document.getElementById(`msg-${idCampo}`);
      const input = document.getElementById(idCampo);
      if (span) span.textContent = mensagem;
      if (input) input.classList.add("input-erro");
    };

    const limparErros = () => {
      document.querySelectorAll(".msg-erro").forEach(el => el.textContent = "");
      document.querySelectorAll(".input-erro").forEach(el => el.classList.remove("input-erro"));
    };

    form.addEventListener("submit", (e) => {
      limparErros();
      let temErro = false;

      const nome = document.getElementById("nome").value.trim();
      const descricao = document.getElementById("descricao").value.trim();
      const dataInicio = document.getElementById("dataInicio").value;
      const dataFim = document.getElementById("dataFim").value;
      const horarioInicio = document.getElementById("horarioInicio").value;
      const horarioFim = document.getElementById("horarioFim").value;

      if (nome.length < 3) {
        setErro("nome", "Mínimo de 3 caracteres.");
        temErro = true;
      }
      if (descricao.length > 1000) {
        setErro("descricao", "Máximo de 1000 caracteres.");
        temErro = true;
      }

      if (dataInicio && dataFim && horarioInicio && horarioFim) {
        const inicio = new Date(`${dataInicio}T${horarioInicio}`);
        const fim = new Date(`${dataFim}T${horarioFim}`);
        const agora = new Date();

        if (isNaN(inicio.getTime())) {
          setErro("dataInicio", "Data inválida.");
          temErro = true;
        } else if (inicio < agora) {
          setErro("dataInicio", "A data não pode ser no passado.");
          temErro = true;
        }

        if (fim <= inicio) {
          setErro("dataFim", "Deve ser após o início.");
          setErro("horarioFim", "Horário inválido.");
          temErro = true;
        }
      }

      if (temErro) {
        e.preventDefault();
      }
    });
  }
});
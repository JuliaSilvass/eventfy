document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-servico");
  const diasContainer = document.querySelector(".dias-semana");
  const horariosContainer = document.getElementById("container-horarios");

  // Lógica de Upload de Imagens
  const areaUpload = document.getElementById("area-upload");
  const inputArquivo = document.getElementById("input-arquivo");
  const previaImagensContainer = document.getElementById("previa-imagens");
  let arquivosSelecionados = [];
  const LIMITE_IMAGENS = 5;

  areaUpload.addEventListener("click", () => inputArquivo.click());
  inputArquivo.addEventListener("change", (e) => handleFiles(e.target.files));
  areaUpload.addEventListener("dragover", (e) => { e.preventDefault(); areaUpload.classList.add("drag-over"); });
  areaUpload.addEventListener("dragleave", () => areaUpload.classList.remove("drag-over"));
  areaUpload.addEventListener("drop", (e) => {
    e.preventDefault();
    areaUpload.classList.remove("drag-over");
    handleFiles(e.dataTransfer.files);
  });

  function handleFiles(files) {
    if (arquivosSelecionados.length + files.length > LIMITE_IMAGENS) {
      alert(`Você pode selecionar no máximo ${LIMITE_IMAGENS} imagens.`);
      return;
    }
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
      const divPrevia = document.createElement('div');
      divPrevia.className = 'previa-item';
      const img = document.createElement('img');
      img.src = e.target.result;
      img.className = 'previa-imagem';
      const btnRemover = document.createElement('button');
      btnRemover.type = 'button';
      btnRemover.className = 'remover-imagem-btn';
      btnRemover.innerHTML = '&times;';
      btnRemover.onclick = () => {
        const index = arquivosSelecionados.indexOf(file);
        if (index > -1) arquivosSelecionados.splice(index, 1);
        divPrevia.remove();
      };
      divPrevia.appendChild(img);
      divPrevia.appendChild(btnRemover);
      previaImagensContainer.appendChild(divPrevia);
    };
    reader.readAsDataURL(file);
  }

  // Lógica de Horários
  const nomesDosDias = {
    dom: "Domingo", seg: "Segunda-feira", ter: "Terça-feira",
    qua: "Quarta-feira", qui: "Quinta-feira", sex: "Sexta-feira", sab: "Sábado"
  };

  function atualizarBotoes(blocoDoDia) {
    const todosIntervalos = blocoDoDia.querySelectorAll('.intervalo-tempo');
    todosIntervalos.forEach((intervalo, index) => {
      const btnAdicionar = intervalo.querySelector('.btn-adicionar-horario');
      if (btnAdicionar) {
        btnAdicionar.style.display = (index === todosIntervalos.length - 1) ? 'inline-block' : 'none';
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
        atualizarBotoes(novoBlocoHorario);
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
      if (blocoDoDia.querySelectorAll('.intervalo-tempo').length === 1) {
        const diaAbreviado = blocoDoDia.dataset.dia;
        const bolinhaDia = document.querySelector(`.dia-bolinha[data-dia="${diaAbreviado}"]`);
        if (bolinhaDia) bolinhaDia.classList.remove("ativo");
        blocoDoDia.remove();
      } else {
        intervaloParaRemover.remove();
        atualizarBotoes(blocoDoDia);
      }
    }
  });

  //VALIDAÇÕES E ENVIO DO FORMULÁRIO
  function mostrarErro(campo, mensagem) {
    const erroExistente = campo.parentElement.querySelector('.erro-servico');
    if (erroExistente) erroExistente.remove();
    const spanErro = document.createElement('span');
    spanErro.className = 'erro-servico';
    spanErro.textContent = mensagem;
    campo.parentElement.appendChild(spanErro);
  }

  function removerTodosErros() {
    document.querySelectorAll('.erro-servico').forEach(e => e.remove());
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    removerTodosErros();
    let ehValido = true;

    const titulo = document.getElementById('nome-servico');
    const categoria = document.getElementById('categoria');
    const preco = document.getElementById('preco');
    const descricao = document.getElementById('descricao');
    const diasAtivos = document.querySelectorAll('.dia-bolinha.ativo');

    if (titulo.value.trim().length < 5) {
      mostrarErro(titulo, "O nome do serviço deve ter pelo menos 5 caracteres.");
      ehValido = false;
    }
    if (!categoria.value) {
      mostrarErro(categoria, "Por favor, selecione uma categoria.");
      ehValido = false;
    }
    if (!preco.value || parseFloat(preco.value) <= 0) {
      mostrarErro(preco, "O preço é obrigatório e deve ser um valor positivo.");
      ehValido = false;
    }
    if (descricao.value.trim().length < 10) {
      mostrarErro(descricao, "A descrição é obrigatória e deve ter pelo menos 10 caracteres.");
      ehValido = false;
    }
    if (arquivosSelecionados.length === 0) {
      mostrarErro(areaUpload, "É obrigatório enviar pelo menos uma foto do serviço.");
      ehValido = false;
    }
    if (diasAtivos.length === 0) {
      mostrarErro(diasContainer.parentElement, "É obrigatório selecionar pelo menos um dia de disponibilidade.");
      ehValido = false;
    }

    document.querySelectorAll('.bloco-horario-dia').forEach(bloco => {
      let horariosEstaoValidos = true;
      const intervalos = Array.from(bloco.querySelectorAll('.intervalo-tempo'));

      for (const intervalo of intervalos) {
        const inicio = intervalo.querySelector('input[name="inicio"]').value;
        const fim = intervalo.querySelector('input[name="fim"]').value;
        if (!inicio || !fim) {
          mostrarErro(bloco, "Todos os horários devem ser preenchidos.");
          horariosEstaoValidos = false;
          break;
        }
        if (inicio >= fim) {
          mostrarErro(bloco, "O horário de término deve ser maior que o de início.");
          horariosEstaoValidos = false;
          break;
        }
      }

      if (!horariosEstaoValidos) {
        ehValido = false;
        return;
      }

      intervalos.sort((a, b) => {
        const inicioA = a.querySelector('input[name="inicio"]').value;
        const inicioB = b.querySelector('input[name="inicio"]').value;
        return inicioA.localeCompare(inicioB);
      });

      let sobreposicaoEncontrada = false;
      for (let i = 0; i < intervalos.length - 1; i++) {
        const fimAtual = intervalos[i].querySelector('input[name="fim"]').value;
        const inicioProximo = intervalos[i + 1].querySelector('input[name="inicio"]').value;

        if (fimAtual > inicioProximo) {
          sobreposicaoEncontrada = true;
          break;
        }
      }

      if (sobreposicaoEncontrada) {
        mostrarErro(bloco, "Os horários para este dia não podem se sobrepor.");
        ehValido = false;
      }
    });

    if (!ehValido) return;

    //Montagem dos dados para envio
    const formData = new FormData();
    formData.append('titulo', titulo.value);
    formData.append('categoria', categoria.value);
    formData.append('preco', parseFloat(preco.value));
    formData.append('descricao', descricao.value);
    arquivosSelecionados.forEach(file => formData.append('imagens', file));
    const disponibilidade = {};
    document.querySelectorAll('.bloco-horario-dia').forEach(bloco => {
      const dia = bloco.dataset.dia;
      const horarios = [];
      bloco.querySelectorAll('.intervalo-tempo').forEach(intervalo => {
        horarios.push({
          inicio: intervalo.querySelector('input[name="inicio"]').value,
          fim: intervalo.querySelector('input[name="fim"]').value
        });
      });
      disponibilidade[dia] = horarios;
    });
    formData.append('disponibilidade', JSON.stringify(disponibilidade));

    try {
      console.log("Enviando para o backend (via FormData):");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      alert("Simulação: Serviço pronto para ser enviado! Validações passaram.");

    } catch (error) {
      console.error("Erro ao cadastrar serviço:", error);
      alert(`Falha ao cadastrar: ${error.message}`);
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const telefoneInput = document.getElementById("telefone");

  telefoneInput.addEventListener("input", (e) => {
    let valorLimpo = e.target.value.replace(/\D/g, "");
    let valorFormatado = "";

    if (valorLimpo.length > 0) {
      valorFormatado = `(${valorLimpo.substring(0, 2)}`;
    }
    if (valorLimpo.length > 2) {
      valorFormatado += `) ${valorLimpo.substring(2, 7)}`;
    }
    if (valorLimpo.length > 7) {
      valorFormatado += `-${valorLimpo.substring(7, 11)}`;
    }
    
    e.target.value = valorFormatado;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    removerTodosErros();

    if (validarFormulario()) {
      const dadosUsuario = {
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        cpf: document.getElementById("cpf").value.replace(/\D/g, ""),
        senha: document.getElementById("senha").value,
        dataNasc: document.getElementById("datanasc").value,
        telefone: document.getElementById("telefone").value.replace(/\D/g, ""),
        tipo: 'cliente'
      };

      console.log("Formulário válido. Enviando dados:", dadosUsuario);
      alert("Validação passou! (Simulação de envio)");
    }
  });
});

function validarFormulario() {
  let valido = true;
  const nome = document.getElementById("nome");
  const email = document.getElementById("email");
  const cpf = document.getElementById("cpf");
  const senha = document.getElementById("senha");
  const confSenha = document.getElementById("confsenha");
  const dataNasc = document.getElementById("datanasc");
  const telefone = document.getElementById("telefone");

  if (nome.value.trim().length < 3) {
    mostrarErro(nome, "O nome deve ter pelo menos 3 caracteres.");
    valido = false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    mostrarErro(email, "Digite um e-mail válido.");
    valido = false;
  }
  if (!validarCPF(cpf.value)) {
    mostrarErro(cpf, "Digite um CPF válido.");
    valido = false;
  }
  
  const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!senhaRegex.test(senha.value)) {
    mostrarErro(
      senha,
      "A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial."
    );
    valido = false;
  }

  if (senha.value !== confSenha.value) {
    mostrarErro(confSenha, "As senhas não coincidem.");
    valido = false;
  }
  if (!validarIdade(dataNasc.value, 18)) {
    mostrarErro(dataNasc, "É necessário ter pelo menos 18 anos.");
    valido = false;
  }
  if (!/^\d{10,11}$/.test(telefone.value.replace(/\D/g, ""))) {
    mostrarErro(telefone, "Digite um telefone válido (com DDD).");
    valido = false;
  }
  return valido;
}

function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0, resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;
  return true;
}

function validarIdade(dataStr, idadeMinima) {
  if (!dataStr) return false;
  const hoje = new Date();
  const nascimento = new Date(dataStr);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade >= idadeMinima;
}

function mostrarErro(campo, mensagem) {
  const erro = document.createElement("span");
  erro.className = "erro";
  erro.textContent = mensagem;
  campo.parentNode.appendChild(erro);
  setTimeout(() => {
    erro.classList.add('fade-out');
    erro.addEventListener('transitionend', () => {
      erro.remove();
    });
  }, 5000);
}

function removerTodosErros() {
  const mensagensErro = document.querySelectorAll(".erro");
  mensagensErro.forEach((erro) => erro.remove());
}
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

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

  //Nome
  if (nome.value.trim().length < 3) {
    mostrarErro(nome, "O nome deve ter pelo menos 3 caracteres.");
    valido = false;
  }

  //Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    mostrarErro(email, "Digite um e-mail válido.");
    valido = false;
  }

  //CPF
  if (!validarCPF(cpf.value)) {
    mostrarErro(cpf, "Digite um CPF válido.");
    valido = false;
  }

  //Senha
  const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  if (!senhaRegex.test(senha.value)) {
    mostrarErro(
      senha,
      "A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial."
    );
    valido = false;
  }

  //Confirmação de senha
  if (senha.value !== confSenha.value) {
    mostrarErro(confSenha, "As senhas não coincidem.");
    valido = false;
  }

  //Data de nascimento
  if (!validarIdade(dataNasc.value, 12)) {
    mostrarErro(dataNasc, "É necessário ter pelo menos 12 anos.");
    valido = false;
  }

  //Telefone
  const telRegex = /^\d{10,11}$/;
  if (!telRegex.test(telefone.value.replace(/\D/g, ""))) {
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
  erro.style.color = "red";
  erro.style.fontSize = "0.85em";
  erro.textContent = mensagem;
  campo.parentNode.appendChild(erro);
}

function removerTodosErros() {
  document.querySelectorAll(".erro").forEach((el) => el.remove());
}
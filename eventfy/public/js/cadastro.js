document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  // --- LÓGICA DE SELEÇÃO DE PERFIL ---
  const btnOrganizador = document.getElementById('btnOrganizador');
  const btnFornecedor = document.getElementById('btnFornecedor');
  
  const camposOrganizador = document.querySelectorAll('.field-organizer');
  const camposFornecedor = document.querySelectorAll('.field-supplier');

  btnOrganizador.addEventListener('click', () => {
    btnOrganizador.classList.add('active');
    btnFornecedor.classList.remove('active');
    
    camposOrganizador.forEach(campo => campo.style.display = 'flex');
    camposFornecedor.forEach(campo => campo.style.display = 'none');
  });

  btnFornecedor.addEventListener('click', () => {
    btnFornecedor.classList.add('active');
    btnOrganizador.classList.remove('active');

    camposFornecedor.forEach(campo => campo.style.display = 'flex');
    camposOrganizador.forEach(campo => campo.style.display = 'none');
  });


  // --- LÓGICA DAS MÁSCARAS DE INPUT ---
  const telefoneInput = document.getElementById("telefone");
  const cnpjInput = document.getElementById("cnpj");
  const cpfInput = document.getElementById("cpf");

  telefoneInput.addEventListener("input", (e) => {
    let valorLimpo = e.target.value.replace(/\D/g, "");
    let valorFormatado = "";
    if (valorLimpo.length > 0) { valorFormatado = `(${valorLimpo.substring(0, 2)}`; }
    if (valorLimpo.length > 2) { valorFormatado += `) ${valorLimpo.substring(2, 7)}`; }
    if (valorLimpo.length > 7) { valorFormatado += `-${valorLimpo.substring(7, 11)}`; }
    e.target.value = valorFormatado;
  });

  if (cnpjInput) {
    cnpjInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "");
      value = value.replace(/^(\d{2})(\d)/, "$1.$2");
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
      value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
      value = value.replace(/(\d{4})(\d)/, "$1-$2");
      e.target.value = value;
    });
  }

   if (cpfInput) {
    cpfInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não é número
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

      e.target.value = value;
    });
  }


  // --- ENVIO DO FORMULÁRIO ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    removerTodosErros();

    if (validarFormulario()) {
      const isOrganizador = btnOrganizador.classList.contains('active');
      
      const dadosUsuario = {
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        senha: document.getElementById("senha").value,
        telefone: telefoneInput.value.replace(/\D/g, ""),
        tipo: isOrganizador ? 'organizador' : 'fornecedor'
      };

      if (isOrganizador) {
        dadosUsuario.cpf = document.getElementById("cpf").value.replace(/\D/g, "");
        dadosUsuario.dataNasc = document.getElementById("datanasc").value;
      } else {
        dadosUsuario.cnpj = document.getElementById("cnpj").value.replace(/\D/g, "");
      }

      console.log("Formulário válido. Enviando dados:", dadosUsuario);
      alert("Validação passou! (Simulação de envio)");
    }
  });
});

// --- FUNÇÃO DE VALIDAÇÃO GERAL ---
function validarFormulario() {
  let valido = true;
  const isOrganizador = document.getElementById('btnOrganizador').classList.contains('active');

  const nome = document.getElementById("nome");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  const confSenha = document.getElementById("confsenha");
  const telefone = document.getElementById("telefone");

  if (nome.value.trim().length < 3) { valido = false; mostrarErro(nome, "O nome deve ter pelo menos 3 caracteres."); }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { valido = false; mostrarErro(email, "Digite um e-mail válido."); }
  
  const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!senhaRegex.test(senha.value)) { valido = false; mostrarErro(senha, "A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial."); }
  
  if (senha.value !== confSenha.value) { valido = false; mostrarErro(confSenha, "As senhas não coincidem."); }
  if (!/^\d{10,11}$/.test(telefone.value.replace(/\D/g, ""))) { valido = false; mostrarErro(telefone, "Digite um telefone válido (com DDD)."); }

  if (isOrganizador) {
    const cpf = document.getElementById("cpf");
    const dataNasc = document.getElementById("datanasc");
    if (!validarCPF(cpf.value)) { valido = false; mostrarErro(cpf, "Digite um CPF válido."); }
    if (!validarIdade(dataNasc.value, 18)) { valido = false; mostrarErro(dataNasc, "É necessário ter pelo menos 18 anos."); }
  } else {
    const cnpj = document.getElementById("cnpj");
    if (cnpj.value.replace(/\D/g, '').length !== 14) { valido = false; mostrarErro(cnpj, "Digite um CNPJ válido."); }
  }

  return valido;
}


// --- FUNÇÕES AUXILIARES ---
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0, resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
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
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) { idade--; }
  return idade >= idadeMinima;
}

function mostrarErro(campo, mensagem) {
  const erro = document.createElement("span");
  erro.className = "erro";
  erro.textContent = mensagem;
  campo.parentNode.appendChild(erro);
  setTimeout(() => {
    erro.classList.add('fade-out');
    erro.addEventListener('transitionend', () => { erro.remove(); });
  }, 5000);
}

function removerTodosErros() {
  const mensagensErro = document.querySelectorAll(".erro");
  mensagensErro.forEach((erro) => erro.remove());
}
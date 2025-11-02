document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const senhaInput = document.getElementById("senha");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    removerTodosErros();

    const email = emailInput.value;
    const senha = senhaInput.value;

    if (!email || !senha) {
      mostrarErro(senhaInput, "Por favor, preencha todos os campos.");
      return;
    }

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
        credentials: 'include',
      });

      const result = await response.json();

      console.log("RESULTADO:", result);
      
      if (result.user) {
        localStorage.setItem('userType', result.user.tipo);
        console.log("DEVE IR PARA A PROXIMA PAGINA")
        window.location.href = '/dashboard';
        console.log("foi ???")
      } else {
        throw new Error(result.erro || 'Email ou senha incorretos.');
    }

    } catch (error) {
      console.error("Falha no login:", error);
      mostrarErro(senhaInput, error.message);
    }
  });

  const iconesAlternarSenha = document.querySelectorAll(".alternarSenha");
  iconesAlternarSenha.forEach(icone => {
    icone.addEventListener("click", function() {
      const campoSenha = this.previousElementSibling;
      const ehSenhaOculta = campoSenha.type === "password";
      
      campoSenha.type = ehSenhaOculta ? "text" : "password";
      this.src = ehSenhaOculta ? '/assets/olho-fechar.svg' : '/assets/olho-mostrar.svg';
    });
  });

  function mostrarErro(campo, mensagem) {
    const containerDoCampo = campo.closest('.inputLogin');
    const erroExistente = containerDoCampo.querySelector(".erro");
    if (erroExistente) return;

    const erro = document.createElement("span");
    erro.className = "erro";
    erro.textContent = mensagem;
    containerDoCampo.appendChild(erro);
    
    setTimeout(() => {
      erro.classList.add('fade-out');
      erro.addEventListener('transitionend', () => { erro.remove(); });
    }, 5000);
  }

  function removerTodosErros() {
    const mensagensErro = document.querySelectorAll(".erro");
    mensagensErro.forEach((erro) => erro.remove());
  }
});
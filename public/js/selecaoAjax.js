document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.btn-acao-ajax');
  
  if (btn) {
    e.preventDefault();

    const url = btn.dataset.url;
    const originalText = btn.innerHTML;
    
    btn.style.opacity = '0.7';
    btn.innerText = '...';
    btn.disabled = true;

    try {
      const response = await fetch(url, { method: 'POST' });

      if (response.ok) {
        const novoHtml = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(novoHtml, 'text/html');

        const novoConteudo = doc.querySelector('.cardPrincipal').innerHTML;
        document.querySelector('.cardPrincipal').innerHTML = novoConteudo;

        if (window.inicializarBusca) {
          window.inicializarBusca();
        }

      } else {
        alert('Erro ao atualizar.');
        btn.innerText = originalText;
        btn.style.opacity = '1';
        btn.disabled = false;
      }
    } catch (erro) {
      console.error('Erro AJAX:', erro);
      alert('Erro de conexão.');
      btn.innerText = originalText;
      btn.style.opacity = '1';
      btn.disabled = false;
    }
  }
});
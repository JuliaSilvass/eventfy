document.querySelectorAll('.btn-favorito').forEach(button => {
  button.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const fornecedorId = btn.dataset.id;
    const nomeEmpresa = btn.dataset.nome;

    btn.disabled = true;

    try {
      const response = await fetch('/empresas/favorito', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fornecedorId, nomeEmpresa })
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar favorito');
      }

      const isFavorito = btn.classList.contains('botaoConfirmar');
      
      if (isFavorito) {
        btn.textContent = '⭐ Remover Favorito';
        btn.classList.remove('botaoConfirmar');
        btn.classList.add('botaoCancelar');
      } else {
        btn.textContent = '⭐ Adicionar Favorito';
        btn.classList.remove('botaoCancelar');
        btn.classList.add('botaoConfirmar');
      }

    } catch (err) {
      console.error(err);
      alert('Não foi possível salvar o favorito. Tente novamente.');
    } finally {
      btn.disabled = false;
    }
  });
});
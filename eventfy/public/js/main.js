async function apagarServico(id) {
  // 1. Pede confirmação ao usuário
  if (!confirm('Tem certeza que deseja apagar este serviço?')) {
    return; // Se o usuário clicar em "Cancelar", a função para
  }

  try {
    // 2. Envia a requisição DELETE para o backend
    const response = await fetch(`/servicos/apagar/${id}`, {
      method: 'DELETE'
    });

    // 3. Processa a resposta do backend
    if (response.ok) {
      // Se deu tudo certo (status 200)
      alert('Serviço apagado com sucesso!');
      window.location.reload(); // Recarrega a página para atualizar a lista
    } else {
      // Se o backend retornou um erro 
      const erroMsg = await response.text();
      alert(`Erro ao apagar: ${erroMsg}`);
    }
  } catch (error) {
    // Se deu um erro de rede (ex: sem internet)
    console.error('Erro de rede:', error);
    alert('Erro de conexão ao tentar apagar o serviço.');
  }
}
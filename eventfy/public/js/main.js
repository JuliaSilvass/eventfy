async function apagarServico(id) {
  if (!confirm('Tem certeza que deseja apagar este serviço?')) {
    return;
  }

  try {
    const response = await fetch(`/servicos/apagar/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      alert('Serviço apagado com sucesso!');
      window.location.reload();
    } else {
      const erroMsg = await response.text();
      alert(`Erro ao apagar: ${erroMsg}`);
    }
  } catch (error) {
    console.error('Erro de rede:', error);
    alert('Erro de conexão ao tentar apagar o serviço.');
  }
}
function editarServico(id) {
  window.location.href = `/servicos/editar/${id}`;
}

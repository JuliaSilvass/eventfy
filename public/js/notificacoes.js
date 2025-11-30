document.addEventListener("DOMContentLoaded", () => {
  const icon = document.getElementById("notifIcon");
  const dropdown = document.getElementById("notifDropdown");
  const list = document.getElementById("notifList");

  if (icon && dropdown) {
    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("active");
      
      if (dropdown.classList.contains("active")) {
        carregarNotificacoes();
      }
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target) && !icon.contains(e.target)) {
        dropdown.classList.remove("active");
      }
    });
  }

  async function carregarNotificacoes() {
    try {
      const res = await fetch("/notificacoes/dados");
      const html = await res.text();
      list.innerHTML = html;
    } catch (error) {
      console.error(error);
      list.innerHTML = '<div class="notification-empty">Erro ao carregar notificações.</div>';
    }
  }

  window.marcarLida = async (id, element) => {
    if (element.classList.contains("unread")) {
      try {
        await fetch(`/notificacoes/lida/${id}`, { method: "POST" });
        element.classList.remove("unread");
      } catch (e) {
        console.error(e);
      }
    }
  };
});
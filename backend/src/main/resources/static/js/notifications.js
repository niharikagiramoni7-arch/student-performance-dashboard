/**
 * In-App Notification Manager
 */

const notifications = {
  async init() {
    const btn = document.getElementById('notif-btn');
    const dropdown = document.getElementById('notif-dropdown');
    const markAllBtn = document.getElementById('mark-all-read-btn');

    if (!btn || !dropdown) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== btn) {
        dropdown.classList.remove('show');
      }
    });

    if (markAllBtn) {
      markAllBtn.addEventListener('click', async () => {
        try {
          await api.put('/notifications/read-all');
          await this.load();
          showToast('All notifications marked as read', 'info');
        } catch (e) {
          console.error(e);
        }
      });
    }

    await this.load();
    // Poll every 30 seconds
    setInterval(() => this.load(), 30000);
  },

  async load() {
    try {
      const resp = await api.get('/notifications');
      const list = resp.notifications || [];
      const unreadCount = resp.unreadCount || 0;

      const badge = document.getElementById('notif-badge');
      if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
      }

      const listContainer = document.getElementById('notif-list');
      if (listContainer) {
        if (list.length === 0) {
          listContainer.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No notifications yet.</div>';
          return;
        }

        listContainer.innerHTML = list.map(n => `
          <div class="notif-item ${!n.isRead ? 'unread' : ''}" onclick="notifications.markAsRead(${n.id})">
            <div class="notif-title">${this.escapeHtml(n.title)}</div>
            <div class="notif-msg">${this.escapeHtml(n.message)}</div>
            <div class="notif-time">${new Date(n.createdAt).toLocaleString()}</div>
          </div>
        `).join('');
      }
    } catch (err) {
      // Silently ignore if unauthenticated or on login page
    }
  },

  async markAsRead(id) {
    try {
      await api.put(`/notifications/${id}/read`);
      await this.load();
    } catch (e) {
      console.error(e);
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};

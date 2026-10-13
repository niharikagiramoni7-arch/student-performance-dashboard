/**
 * API Client & Toast Notification System
 * Centralized HTTP requests with Bearer Token handling and robust error responses.
 */

// Determine base API URL dynamically (supports both local standalone frontend and Spring Boot served)
const API_BASE = (window.location.protocol === 'file:')
  ? 'http://localhost:8080/api'
  : (window.location.port === '8080')
    ? '/api'
    : (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1'))
      ? 'http://localhost:8080/api'
      : '/api';

const api = {
  getToken() {
    return localStorage.getItem('spd_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('spd_token', token);
    } else {
      localStorage.removeItem('spd_token');
    }
  },

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Accept': 'application/json',
      ...(options.headers || {})
    };

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Token expired or invalid
        const currentPath = window.location.pathname;
        if (!currentPath.includes('login') && !currentPath.includes('register') && !currentPath.includes('index') && !currentPath.includes('role-selection')) {
          localStorage.clear();
          showToast('Session expired. Please log in again.', 'warning');
          setTimeout(() => {
            window.location.href = '/role-selection.html';
          }, 1200);
          throw new Error('Unauthorized');
        }
      }

      if (response.status === 204) {
        return null;
      }

      const contentType = response.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType.includes('text/csv') || contentType.includes('application/octet-stream')) {
        return response; // Return response stream for downloads
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorMsg = (data && data.message) || (data && data.error) || response.statusText || 'An error occurred';
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      if (err.message !== 'Unauthorized') {
        console.error('API Error:', err.message);
      }
      throw err;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data)
    });
  },

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  async download(endpoint, postData, defaultFilename = 'download.csv') {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const token = this.getToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      throw new Error('Download failed: ' + response.statusText);
    }

    const blob = await response.blob();
    const disposition = response.headers.get('content-disposition');
    let filename = defaultFilename;
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    }

    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }
};

/**
 * Toast Notification Popup
 */
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  toast.innerHTML = `
    <span style="font-size: 1.1rem;">${iconMap[type] || 'ℹ️'}</span>
    <div style="flex: 1;">
      <div style="font-weight: 600; font-size: 0.85rem; margin-bottom: 2px;">
        ${type.toUpperCase()}
      </div>
      <div style="color: var(--text-muted); font-size: 0.8rem;">
        ${message}
      </div>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

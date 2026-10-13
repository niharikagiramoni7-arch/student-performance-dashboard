/**
 * Admin Dashboard Logic
 */

let adminStats = null;
let currentUsersPage = 0;
let totalUsersPages = 1;

document.addEventListener('DOMContentLoaded', async () => {
  if (!auth.requireRole('ROLE_ADMIN')) return;

  notifications.init();
  auth.renderRoleSwitcher('role-switcher-container', 'ROLE_ADMIN');
  setupNavigation();
  await loadAdminOverview();
  await loadUsersList(0);
  await loadSubjects();
  setupEventListeners();
});

function setupNavigation() {
  const links = document.querySelectorAll('.sidebar-nav .nav-link');
  const panes = document.querySelectorAll('.tab-pane');
  const pageTitle = document.getElementById('current-page-title');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = link.dataset.tab;
      if (!tab) return;

      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      panes.forEach(p => p.classList.remove('active'));
      const activePane = document.getElementById(`pane-${tab}`);
      if (activePane) activePane.classList.add('active');

      if (pageTitle) {
        const titles = {
          dashboard: 'System Overview & Analytics',
          users: 'User Account Management',
          subjects: 'Curriculum & Subjects',
          reports: 'Institutional Academic Reports',
          'audit-logs': 'Login Audit Logs & Security Tracking',
          announcements: 'Campus Announcements & Broadcasts',
          config: 'System Configuration & Departments',
          profile: 'Administrator Profile'
        };
        pageTitle.textContent = titles[tab] || 'Admin Portal';
      }

      if (tab === 'dashboard' && adminStats) {
        renderAdminCharts(adminStats);
      } else if (tab === 'audit-logs') {
        loadLoginAudits(0);
      } else if (tab === 'config') {
        loadSystemConfig();
        loadDepartments();
      }

      document.querySelector('.sidebar').classList.remove('open');
    });
  });

  const toggleBtn = document.getElementById('menu-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelector('.sidebar').classList.toggle('open');
    });
  }

  // Close sidebar on tapping outside on mobile
  document.addEventListener('click', (e) => {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && sidebar.classList.contains('open')) {
      if (!sidebar.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
        sidebar.classList.remove('open');
      }
    }
  });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => auth.logout());
  }
}

async function loadAdminOverview() {
  try {
    adminStats = await api.get('/admin/statistics');
    renderStatsCards(adminStats);
    renderAdminCharts(adminStats);

    const user = auth.getUser();
    if (user) {
      document.getElementById('header-admin-name').textContent = user.fullName;
      document.getElementById('prof-name').value = user.fullName;
      document.getElementById('prof-email').value = user.email;
      document.getElementById('prof-phone').value = user.phone || '';
    }
  } catch (err) {
    showToast('Failed to load admin stats: ' + err.message, 'error');
  }
}

function renderStatsCards(stats) {
  document.getElementById('stat-total-students').textContent = stats.totalStudents;
  document.getElementById('stat-total-faculty').textContent = stats.totalFaculty;
  document.getElementById('stat-total-subjects').textContent = stats.totalSubjects;
  document.getElementById('stat-avg-cgpa').textContent = Number(stats.averageCgpa).toFixed(2);
  document.getElementById('stat-avg-attendance').textContent = `${stats.averageAttendance}%`;
}

function renderAdminCharts(stats) {
  // 1. Students by Department (doughnut)
  const deptLabels = Object.keys(stats.studentsByDepartment || {});
  const deptCounts = Object.values(stats.studentsByDepartment || {});
  spdCharts.renderDoughnutChart('chartStudentsByDept', deptLabels, deptCounts, ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b']);

  // 2. Average CGPA by Department (bar)
  const cgpaLabels = Object.keys(stats.averageCgpaByDepartment || {});
  const cgpaValues = Object.values(stats.averageCgpaByDepartment || {});
  spdCharts.renderBarChart('chartCgpaByDept', cgpaLabels, cgpaValues, 'Average CGPA', '#4f46e5');

  // 3. Average Attendance by Department (bar)
  const attLabels = Object.keys(stats.averageAttendanceByDepartment || {});
  const attValues = Object.values(stats.averageAttendanceByDepartment || {});
  spdCharts.renderBarChart('chartAttByDept', attLabels, attValues, 'Average Attendance %', '#10b981');

  // 4. Performance by Semester (line)
  const semLabels = Object.keys(stats.performanceBySemester || {}).map(s => `Semester ${s}`);
  const semGpas = Object.values(stats.performanceBySemester || {});
  spdCharts.renderLineChart('chartPerfBySem', semLabels, semGpas, 'Semester Average GPA', '#0ea5e9');
}

async function loadUsersList(page = 0) {
  currentUsersPage = page;
  const role = document.getElementById('user-role-filter') ? document.getElementById('user-role-filter').value : '';
  const search = document.getElementById('user-search-input') ? document.getElementById('user-search-input').value.trim() : '';

  try {
    const data = await api.get(`/admin/users?role=${encodeURIComponent(role)}&search=${encodeURIComponent(search)}&page=${page}&size=10`);
    totalUsersPages = data.totalPages || 1;
    renderUsersTable(data.users || []);
    renderPagination(data.currentPage || 0, totalUsersPages, data.totalItems || 0);
  } catch (err) {
    showToast('Failed to load users: ' + err.message, 'error');
  }
}

function renderUsersTable(users) {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;

  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No users found.</td></tr>';
    return;
  }

  tbody.innerHTML = users.map(u => `
    <tr>
      <td><strong>${escapeHtml(u.fullName)}</strong></td>
      <td>${escapeHtml(u.email)}</td>
      <td><span class="badge ${getRoleBadge(u.role)}">${u.role.replace('ROLE_', '')}</span></td>
      <td>${escapeHtml(u.identifier || '-')}</td>
      <td>${escapeHtml(u.department || '-')}</td>
      <td>${escapeHtml(u.phone || '-')}</td>
      <td><span class="badge ${u.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}">${u.status}</span></td>
      <td style="white-space: nowrap;">
        <button class="btn btn-secondary btn-sm" onclick="openEditUserModal(${u.id}, '${escapeHtml(u.fullName)}', '${escapeHtml(u.phone || '')}', '${escapeHtml(u.department || '')}', '${u.status}')">Edit</button>
        <button class="btn ${u.status === 'ACTIVE' ? 'btn-secondary' : 'btn-success'} btn-sm" onclick="toggleUserStatus(${u.id}, '${u.status}')" title="${u.status === 'ACTIVE' ? 'Deactivate account' : 'Activate account'}">
          ${u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        </button>
        <button class="btn btn-danger btn-sm" onclick="confirmDeleteUser(${u.id}, '${escapeHtml(u.fullName)}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

window.toggleUserStatus = async function(id, currentStatus) {
  const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  try {
    const resp = await api.put(`/admin/users/${id}/status?status=${newStatus}`);
    showToast(resp.message || `User marked as ${newStatus}`, 'success');
    await loadUsersList(currentUsersPage);
  } catch (err) {
    showToast('Failed to change status: ' + err.message, 'error');
  }
};

function renderPagination(current, total, totalItems) {
  const container = document.getElementById('users-pagination');
  if (!container) return;

  container.innerHTML = `
    <div style="font-size: 0.85rem; color: var(--text-muted);">Showing page ${current + 1} of ${total} (${totalItems} total users)</div>
    <div style="display: flex; gap: 0.5rem;">
      <button class="btn btn-secondary btn-sm" ${current === 0 ? 'disabled' : ''} onclick="loadUsersList(${current - 1})">Previous</button>
      <button class="btn btn-secondary btn-sm" ${current + 1 >= total ? 'disabled' : ''} onclick="loadUsersList(${current + 1})">Next</button>
    </div>
  `;
}

async function loadSubjects() {
  try {
    const list = await api.get('/admin/subjects');
    const tbody = document.getElementById('subjects-table-body');
    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No subjects found.</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(s => `
      <tr>
        <td><strong>${escapeHtml(s.code)}</strong></td>
        <td>${escapeHtml(s.name)}</td>
        <td>${escapeHtml(s.department)}</td>
        <td>${s.credits} Credits</td>
        <td>Semester ${s.semester}</td>
      </tr>
    `).join('');
  } catch (err) {
    showToast('Failed to load subjects: ' + err.message, 'error');
  }
}

// User CRUD Modals
window.openCreateUserModal = function() {
  document.getElementById('create-user-modal').classList.add('show');
  toggleRoleSpecificFields();
};

window.closeCreateUserModal = function() {
  document.getElementById('create-user-modal').classList.remove('show');
};

window.toggleRoleSpecificFields = function() {
  const role = document.getElementById('new-user-role').value;
  const studentFields = document.getElementById('role-fields-student');
  const facultyFields = document.getElementById('role-fields-faculty');

  if (role === 'ROLE_STUDENT') {
    studentFields.style.display = 'block';
    facultyFields.style.display = 'none';
  } else if (role === 'ROLE_FACULTY') {
    studentFields.style.display = 'none';
    facultyFields.style.display = 'block';
  } else {
    studentFields.style.display = 'none';
    facultyFields.style.display = 'none';
  }
};

let editUserId = null;
window.openEditUserModal = function(id, name, phone, dept, status) {
  editUserId = id;
  document.getElementById('edit-user-name').value = name;
  document.getElementById('edit-user-phone').value = phone;
  document.getElementById('edit-user-dept').value = dept;
  document.getElementById('edit-user-status').value = status;
  document.getElementById('edit-user-modal').classList.add('show');
};

window.closeEditUserModal = function() {
  document.getElementById('edit-user-modal').classList.remove('show');
  editUserId = null;
};

let deleteTargetId = null;
window.confirmDeleteUser = function(id, name) {
  deleteTargetId = id;
  document.getElementById('delete-user-msg').textContent = `Are you sure you want to permanently delete or deactivate account: ${name}?`;
  document.getElementById('delete-user-modal').classList.add('show');
};

window.closeDeleteUserModal = function() {
  document.getElementById('delete-user-modal').classList.remove('show');
  deleteTargetId = null;
};

window.executeDeleteUser = async function() {
  if (!deleteTargetId) return;
  try {
    const resp = await api.delete(`/admin/users/${deleteTargetId}`);
    showToast(resp.message || 'User deleted.', 'success');
    closeDeleteUserModal();
    await loadUsersList(currentUsersPage);
    await loadAdminOverview();
  } catch (err) {
    showToast('Failed to delete user: ' + err.message, 'error');
  }
};

function setupEventListeners() {
  // Users Search & Filter
  const userFilterBtn = document.getElementById('user-filter-btn');
  if (userFilterBtn) {
    userFilterBtn.addEventListener('click', () => loadUsersList(0));
  }

  // Create User Form
  const createUserForm = document.getElementById('create-user-form');
  if (createUserForm) {
    createUserForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        fullName: document.getElementById('new-user-name').value.trim(),
        email: document.getElementById('new-user-email').value.trim(),
        password: document.getElementById('new-user-password').value || 'Welcome@123',
        phone: document.getElementById('new-user-phone').value.trim(),
        role: document.getElementById('new-user-role').value,
        department: document.getElementById('new-user-dept').value,
        studentId: document.getElementById('new-user-studentid').value.trim(),
        year: parseInt(document.getElementById('new-user-year').value || '1'),
        section: document.getElementById('new-user-section').value,
        employeeId: document.getElementById('new-user-empid').value.trim(),
        designation: document.getElementById('new-user-desig').value.trim()
      };

      if (payload.role === 'ROLE_STUDENT') {
        if (!/^70572400\d{3,}$/.test(payload.studentId)) {
          showToast('Student ID must begin with 70572400 followed by 3 digits (e.g. 70572400001)', 'error');
          return;
        }
      } else if (payload.role === 'ROLE_FACULTY') {
        if (!/^A0[0-9A-Za-z]{2,}$/i.test(payload.employeeId)) {
          showToast('Faculty ID must begin with A0 (e.g. A001)', 'error');
          return;
        }
        payload.employeeId = payload.employeeId.toUpperCase();
      }

      try {
        const resp = await api.post('/admin/users', payload);
        showToast(resp.message || 'User created successfully!', 'success');
        closeCreateUserModal();
        createUserForm.reset();
        await loadUsersList(0);
        await loadAdminOverview();
      } catch (err) {
        showToast('Create user failed: ' + err.message, 'error');
      }
    });
  }

  // Edit User Form
  const editUserForm = document.getElementById('edit-user-form');
  if (editUserForm) {
    editUserForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!editUserId) return;

      const payload = {
        fullName: document.getElementById('edit-user-name').value.trim(),
        phone: document.getElementById('edit-user-phone').value.trim(),
        department: document.getElementById('edit-user-dept').value.trim(),
        status: document.getElementById('edit-user-status').value
      };

      try {
        const resp = await api.put(`/admin/users/${editUserId}`, payload);
        showToast(resp.message || 'User updated.', 'success');
        closeEditUserModal();
        await loadUsersList(currentUsersPage);
      } catch (err) {
        showToast('Update failed: ' + err.message, 'error');
      }
    });
  }

  // Create Subject Form
  const subjectForm = document.getElementById('create-subject-form');
  if (subjectForm) {
    subjectForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = document.getElementById('sub-code-input').value.trim();
      const name = document.getElementById('sub-name-input').value.trim();
      const department = document.getElementById('sub-dept-select').value;
      const credits = parseInt(document.getElementById('sub-credits-input').value);
      const semester = parseInt(document.getElementById('sub-sem-input').value);

      try {
        const resp = await api.post('/admin/subjects', { code, name, department, credits, semester });
        showToast(resp.message || 'Subject added!', 'success');
        subjectForm.reset();
        await loadSubjects();
        await loadAdminOverview();
      } catch (err) {
        showToast('Failed to add subject: ' + err.message, 'error');
      }
    });
  }

  // Generate Report Button
  const genReportBtn = document.getElementById('generate-report-btn');
  if (genReportBtn) {
    genReportBtn.addEventListener('click', () => reportsManager.generate());
  }

  // Admin Profile Form
  const adminProfForm = document.getElementById('admin-profile-form');
  if (adminProfForm) {
    adminProfForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('prof-name').value.trim();
      const phone = document.getElementById('prof-phone').value.trim();

      try {
        await api.put('/admin/profile', { fullName, phone });
        showToast('Admin profile saved.', 'success');
        const user = auth.getUser();
        if (user) {
          user.fullName = fullName;
          user.phone = phone;
          localStorage.setItem('spd_user', JSON.stringify(user));
        }
      } catch (err) {
        showToast('Failed to update profile: ' + err.message, 'error');
      }
    });
  }

  // Admin Password Form
  const adminPassForm = document.getElementById('admin-password-form');
  if (adminPassForm) {
    adminPassForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentPassword = document.getElementById('current-password').value;
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-new-password').value;

      if (newPassword !== confirmPassword) {
        showToast('New passwords do not match.', 'error');
        return;
      }

      try {
        const resp = await api.put('/admin/password', { currentPassword, newPassword, confirmPassword });
        showToast(resp.message || 'Password updated.', 'success');
        adminPassForm.reset();
      } catch (err) {
        showToast(err.message || 'Password update failed.', 'error');
      }
    });
  }

  // Audit Logs Search & Refresh
  const auditSearchBtn = document.getElementById('audit-search-btn');
  if (auditSearchBtn) {
    auditSearchBtn.addEventListener('click', () => loadLoginAudits(0));
  }
  const auditRefreshBtn = document.getElementById('audit-refresh-btn');
  if (auditRefreshBtn) {
    auditRefreshBtn.addEventListener('click', () => loadLoginAudits(0));
  }

  // Broadcast Announcement Form
  const broadcastForm = document.getElementById('broadcast-announcement-form');
  if (broadcastForm) {
    broadcastForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('ann-title').value.trim();
      const message = document.getElementById('ann-message').value.trim();
      const targetRole = document.getElementById('ann-target').value;
      const type = document.getElementById('ann-type').value;

      try {
        const resp = await api.post('/admin/announcements', { title, message, targetRole, type });
        showToast(resp.message || 'Announcement broadcasted successfully!', 'success');
        broadcastForm.reset();
        const statusAlert = document.getElementById('announcement-status-alert');
        if (statusAlert) {
          statusAlert.style.display = 'block';
          statusAlert.style.background = 'var(--success-light)';
          statusAlert.style.color = 'var(--success)';
          statusAlert.textContent = `✓ Announcement "${title}" dispatched successfully!`;
        }
      } catch (err) {
        showToast('Broadcast failed: ' + err.message, 'error');
      }
    });
  }

  // System Config Form
  const sysConfigForm = document.getElementById('system-config-form');
  if (sysConfigForm) {
    sysConfigForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        institutionName: document.getElementById('cfg-inst-name').value.trim(),
        contactEmail: document.getElementById('cfg-contact-email').value.trim(),
        academicYear: document.getElementById('cfg-acad-year').value.trim(),
        passingPercentage: parseFloat(document.getElementById('cfg-pass-mark').value),
        minAttendancePercentage: parseFloat(document.getElementById('cfg-min-attendance').value)
      };
      try {
        const resp = await api.put('/admin/config', payload);
        showToast(resp.message || 'Configuration updated successfully!', 'success');
      } catch (err) {
        showToast('Failed to save config: ' + err.message, 'error');
      }
    });
  }

  // Create Department Form
  const createDeptForm = document.getElementById('create-dept-form');
  if (createDeptForm) {
    createDeptForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('new-dept-name').value.trim();
      const code = document.getElementById('new-dept-code').value.trim();
      try {
        const resp = await api.post('/admin/departments', { name, code });
        showToast(resp.message || 'Department created!', 'success');
        createDeptForm.reset();
        await loadDepartments();
      } catch (err) {
        showToast('Failed to add department: ' + err.message, 'error');
      }
    });
  }
}

function getRoleBadge(role) {
  if (role === 'ROLE_ADMIN') return 'badge-danger';
  if (role === 'ROLE_FACULTY') return 'badge-warning';
  return 'badge-success';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* =========================================================
   LOGIN AUDIT LOGS LOGIC
   ========================================================= */
let currentAuditPage = 0;
let totalAuditPages = 1;

async function loadLoginAudits(page = 0) {
  currentAuditPage = page;
  const searchInput = document.getElementById('audit-search-input');
  const search = searchInput ? searchInput.value.trim() : '';

  try {
    const data = await api.get(`/admin/login-audits?search=${encodeURIComponent(search)}&page=${page}&size=15`);
    totalAuditPages = data.totalPages || 1;
    renderLoginAuditsTable(data.audits || []);
    renderAuditPagination(data.currentPage || 0, totalAuditPages, data.totalItems || 0);
  } catch (err) {
    showToast('Failed to load login audits: ' + err.message, 'error');
  }
}

function renderLoginAuditsTable(audits) {
  const tbody = document.getElementById('audit-table-body');
  if (!tbody) return;

  if (audits.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No login records found.</td></tr>';
    return;
  }

  tbody.innerHTML = audits.map(a => {
    let statusBadge = 'badge-success';
    if (a.status && a.status.startsWith('FAILED')) {
      statusBadge = 'badge-danger';
    } else if (a.status === 'OTP_CHALLENGED') {
      statusBadge = 'badge-warning';
    }

    const timeStr = a.loginTime ? new Date(a.loginTime).toLocaleString() : '-';

    return `
      <tr>
        <td style="white-space: nowrap; font-size: 0.85rem;">${escapeHtml(timeStr)}</td>
        <td>
          <div style="font-weight: 600;">${escapeHtml(a.fullName || a.email)}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(a.email)}</div>
        </td>
        <td><span class="badge ${getRoleBadge(a.role)}">${escapeHtml(a.role ? a.role.replace('ROLE_', '') : '-')}</span></td>
        <td style="font-family: monospace; font-size: 0.85rem;">${escapeHtml(a.ipAddress || '-')}</td>
        <td><span class="badge ${statusBadge}">${escapeHtml(a.status || '-')}</span></td>
        <td style="font-size: 0.85rem; color: var(--text-muted);">${escapeHtml(a.remarks || '-')}</td>
      </tr>
    `;
  }).join('');
}

function renderAuditPagination(current, total, totalItems) {
  const container = document.getElementById('audit-pagination');
  if (!container) return;

  container.innerHTML = `
    <div style="font-size: 0.85rem; color: var(--text-muted);">Showing page ${current + 1} of ${total} (${totalItems} total login events)</div>
    <div style="display: flex; gap: 0.5rem;">
      <button class="btn btn-secondary btn-sm" ${current === 0 ? 'disabled' : ''} onclick="loadLoginAudits(${current - 1})">Previous</button>
      <button class="btn btn-secondary btn-sm" ${current + 1 >= total ? 'disabled' : ''} onclick="loadLoginAudits(${current + 1})">Next</button>
    </div>
  `;
}

window.exportLoginAuditsCsv = async function() {
  try {
    const token = auth.getToken();
    const res = await fetch('/api/admin/login-audits/export', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Download failed: ' + res.statusText);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `login_audits_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    showToast('Login audits exported successfully!', 'success');
  } catch (err) {
    showToast('Failed to export audits: ' + err.message, 'error');
  }
};

/* =========================================================
   SYSTEM CONFIGURATION & DEPARTMENTS LOGIC
   ========================================================= */
async function loadSystemConfig() {
  try {
    const cfg = await api.get('/admin/config');
    if (cfg) {
      if (document.getElementById('cfg-inst-name')) document.getElementById('cfg-inst-name').value = cfg.institutionName || '';
      if (document.getElementById('cfg-contact-email')) document.getElementById('cfg-contact-email').value = cfg.contactEmail || '';
      if (document.getElementById('cfg-acad-year')) document.getElementById('cfg-acad-year').value = cfg.academicYear || '';
      if (document.getElementById('cfg-pass-mark')) document.getElementById('cfg-pass-mark').value = cfg.passingPercentage || 40;
      if (document.getElementById('cfg-min-attendance')) document.getElementById('cfg-min-attendance').value = cfg.minAttendancePercentage || 75;
    }
  } catch (err) {
    console.error('Failed to load system config:', err);
  }
}

async function loadDepartments() {
  try {
    const list = await api.get('/admin/departments');
    const tbody = document.getElementById('departments-table-body');
    if (!tbody) return;

    if (!list || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">No departments found.</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(d => `
      <tr>
        <td><strong>${escapeHtml(d.code)}</strong></td>
        <td>${escapeHtml(d.name)}</td>
        <td><span class="badge badge-success">ACTIVE</span></td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Failed to load departments:', err);
  }
}

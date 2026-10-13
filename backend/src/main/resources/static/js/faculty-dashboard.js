/**
 * Faculty Dashboard Logic
 */

let facultyData = null;
let allStudentsList = [];
let allSubjectsList = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!auth.requireRole('ROLE_FACULTY')) return;

  notifications.init();
  auth.renderRoleSwitcher('role-switcher-container', 'ROLE_FACULTY');
  setupNavigation();
  await loadFacultyDashboard();
  await loadStudentsList();
  await loadFacultyAssignments();
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
          dashboard: 'Faculty Dashboard Overview',
          students: 'Student Directory & Records',
          attendance: 'Mark & Update Attendance',
          marks: 'Academic Marks Management',
          assignments: 'Coursework & Assignments',
          submissions: 'Student Assignment Submissions',
          notices: 'Class Notices & Broadcasts',
          profile: 'Faculty Profile & Settings'
        };
        pageTitle.textContent = titles[tab] || 'Faculty Portal';
      }

      // Close mobile menu
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

async function loadFacultyDashboard() {
  try {
    facultyData = await api.get('/faculty/dashboard');
    renderFacultyHeader(facultyData);
    renderDashboardStats(facultyData);
    populateSubjectDropdowns(facultyData.subjects || []);
    renderRecentSubmissions(facultyData.recentSubmissions || []);
    renderProfile(facultyData.profile);
  } catch (err) {
    showToast('Failed to load faculty overview: ' + err.message, 'error');
  }
}

function renderFacultyHeader(data) {
  const p = data.profile;
  document.getElementById('header-faculty-name').textContent = p.fullName;
  document.getElementById('header-faculty-designation').textContent = `${p.designation} (${p.department})`;
  document.getElementById('user-avatar-initial').textContent = p.fullName.charAt(0);
}

function renderDashboardStats(data) {
  document.getElementById('stat-total-students').textContent = data.totalStudents;
  document.getElementById('stat-total-subjects').textContent = data.totalSubjects;
  document.getElementById('stat-avg-attendance').textContent = `${data.averageAttendance}%`;
  document.getElementById('stat-avg-marks').textContent = data.averageMarks;
}

function populateSubjectDropdowns(subjects) {
  allSubjectsList = subjects || [];
  const attSubSelect = document.getElementById('att-subject-select');
  const markSubSelect = document.getElementById('mark-subject-select');
  const assSubSelect = document.getElementById('ass-subject-select');

  if (!subjects || subjects.length === 0) {
    const emptyOption = '<option value="">-- No subjects found for department --</option>';
    if (attSubSelect) attSubSelect.innerHTML = emptyOption;
    if (markSubSelect) markSubSelect.innerHTML = emptyOption;
    if (assSubSelect) assSubSelect.innerHTML = emptyOption;
    return;
  }

  const options = '<option value="">-- Choose Subject --</option>' + subjects.map(s => `
    <option value="${s.id}">[${escapeHtml(s.code)}] ${escapeHtml(s.name)} (Sem ${s.semester})</option>
  `).join('');

  if (attSubSelect) attSubSelect.innerHTML = options;
  if (markSubSelect) markSubSelect.innerHTML = options;
  if (assSubSelect) assSubSelect.innerHTML = options;
}

async function loadStudentsList() {
  try {
    const dept = document.getElementById('filter-dept') ? document.getElementById('filter-dept').value : '';
    const year = document.getElementById('filter-year') ? document.getElementById('filter-year').value : '';
    const section = document.getElementById('filter-section') ? document.getElementById('filter-section').value : '';
    const search = document.getElementById('filter-search') ? document.getElementById('filter-search').value : '';

    let query = `?`;
    if (dept) query += `department=${encodeURIComponent(dept)}&`;
    if (year) query += `year=${encodeURIComponent(year)}&`;
    if (section) query += `section=${encodeURIComponent(section)}&`;
    if (search) query += `search=${encodeURIComponent(search)}&`;

    allStudentsList = await api.get(`/faculty/students${query}`);
    renderStudentsTable(allStudentsList);
    populateStudentDropdowns(allStudentsList);
  } catch (err) {
    showToast('Failed to load students: ' + err.message, 'error');
  }
}

function populateStudentDropdowns(students) {
  const attStuSelect = document.getElementById('att-student-select');
  const markStuSelect = document.getElementById('mark-student-select');

  const options = '<option value="">-- Choose Student --</option>' + students.map(s => `
    <option value="${s.id}">[${s.studentId}] ${escapeHtml(s.fullName)} (${s.department})</option>
  `).join('');

  if (attStuSelect) attStuSelect.innerHTML = options;
  if (markStuSelect) markStuSelect.innerHTML = options;
}

function renderStudentsTable(students) {
  const tbody = document.getElementById('students-table-body');
  if (!tbody) return;

  if (students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No matching students found.</td></tr>';
    return;
  }

  tbody.innerHTML = students.map(s => `
    <tr>
      <td><strong>${escapeHtml(s.studentId)}</strong></td>
      <td>${escapeHtml(s.fullName)}</td>
      <td>${escapeHtml(s.department)}</td>
      <td>Year ${s.year} - Sec ${s.section}</td>
      <td><strong>${Number(s.currentCgpa).toFixed(2)}</strong></td>
      <td>
        <span class="badge ${s.attendancePercentage < 75 ? 'badge-danger' : 'badge-success'}">
          ${s.attendancePercentage}%
        </span>
      </td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="quickMarkAttendance(${s.id})">Attendance</button>
        <button class="btn btn-primary btn-sm" onclick="quickEnterMarks(${s.id})">Marks</button>
      </td>
    </tr>
  `).join('');
}

function renderRecentSubmissions(subs) {
  const tbody = document.getElementById('recent-subs-body');
  const allSubBody = document.getElementById('all-submissions-body');

  const html = subs.length === 0
    ? '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No student submissions recorded yet.</td></tr>'
    : subs.map(s => `
      <tr>
        <td><strong>${escapeHtml(s.assignmentTitle)}</strong><br><small style="color: var(--text-muted);">${escapeHtml(s.subjectName)}</small></td>
        <td><strong>${escapeHtml(s.studentName)}</strong><br><small style="color: var(--text-muted);">${escapeHtml(s.studentCode)}</small></td>
        <td>${s.submissionDate ? new Date(s.submissionDate).toLocaleDateString() : 'N/A'}</td>
        <td><span class="badge ${s.status === 'SUBMITTED' ? 'badge-success' : (s.status === 'LATE' ? 'badge-danger' : 'badge-warning')}">${s.status}</span></td>
        <td>${s.marksObtained != null ? `<strong>${s.marksObtained}</strong> / ${s.maxMarks}` : '<span style="color: var(--text-muted);">Ungraded</span>'}</td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="openGradeModal(${s.id}, '${escapeHtml(s.assignmentTitle)}', '${escapeHtml(s.studentName)}', ${s.maxMarks}, ${s.marksObtained || 0}, '${escapeHtml(s.submissionText || '')}')">
            Grade / Review
          </button>
        </td>
      </tr>
    `).join('');

  if (tbody) tbody.innerHTML = html;
  if (allSubBody) allSubBody.innerHTML = html;
}

function renderProfile(p) {
  if (!p) return;
  document.getElementById('prof-name').value = p.fullName || '';
  document.getElementById('prof-id').value = p.employeeId || '';
  document.getElementById('prof-email').value = p.email || '';
  document.getElementById('prof-phone').value = p.phone || '';
  document.getElementById('prof-dept').value = p.department || '';
  document.getElementById('prof-desig').value = p.designation || '';
}

// Quick shortcuts
window.quickMarkAttendance = function(studentId) {
  document.querySelector('[data-tab=attendance]').click();
  const select = document.getElementById('att-student-select');
  if (select) select.value = studentId;
};

window.quickEnterMarks = function(studentId) {
  document.querySelector('[data-tab=marks]').click();
  const select = document.getElementById('mark-student-select');
  if (select) select.value = studentId;
};

// Grade modal handling
let activeSubmissionId = null;
window.openGradeModal = function(id, title, studentName, maxMarks, currentMarks, text) {
  activeSubmissionId = id;
  document.getElementById('grade-modal-title').textContent = `Grade: ${title}`;
  document.getElementById('grade-modal-student').textContent = `Student: ${studentName}`;
  document.getElementById('grade-submission-content').textContent = text || 'No submission text notes provided.';
  document.getElementById('grade-max-label').textContent = `/ ${maxMarks}`;
  document.getElementById('grade-marks-input').value = currentMarks > 0 ? currentMarks : '';
  document.getElementById('grade-marks-input').max = maxMarks;
  document.getElementById('grade-feedback-input').value = '';
  document.getElementById('grade-modal').classList.add('show');
};

window.closeGradeModal = function() {
  document.getElementById('grade-modal').classList.remove('show');
  activeSubmissionId = null;
};

// Assignment modal
window.openCreateAssignmentModal = function() {
  document.getElementById('assignment-modal').classList.add('show');
};

window.closeAssignmentModal = function() {
  document.getElementById('assignment-modal').classList.remove('show');
};

async function loadFacultyAssignments() {
  try {
    const list = await api.get('/faculty/assignments');
    renderFacultyAssignmentsTable(list || []);
  } catch (err) {
    console.error('Failed to load faculty assignments:', err);
    const tbody = document.getElementById('all-faculty-assignments-body');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:2rem;">Click "+ Create New Assignment" above to add coursework.</td></tr>';
    }
  }
}

function renderFacultyAssignmentsTable(assignments) {
  const tbody = document.getElementById('all-faculty-assignments-body');
  if (!tbody) return;

  if (assignments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">No assignments created yet. Click "+ Create New Assignment" above to add coursework.</td></tr>';
    return;
  }

  tbody.innerHTML = assignments.map(a => `
    <tr>
      <td>
        <strong>${escapeHtml(a.title)}</strong><br>
        <small style="color: var(--text-muted);">${escapeHtml(a.subjectName)} (${escapeHtml(a.subjectCode)})</small>
        ${a.description ? `<br><small style="color: var(--text-secondary); font-style: italic;">${escapeHtml(a.description)}</small>` : ''}
      </td>
      <td>${a.assignedDate || 'N/A'}</td>
      <td><strong>${a.dueDate || 'N/A'}</strong></td>
      <td>${a.maxMarks || 100} pts</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="confirmDeleteAssignment(${a.id}, '${escapeHtml(a.title)}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

window.confirmDeleteAssignment = async function(id, title) {
  if (!confirm(`Are you sure you want to delete assignment: "${title}"?`)) return;
  try {
    const resp = await api.delete(`/faculty/assignments/${id}`);
    showToast(resp.message || 'Assignment deleted successfully', 'success');
    await loadFacultyAssignments();
    await loadFacultyDashboard();
  } catch (err) {
    showToast('Failed to delete assignment: ' + err.message, 'error');
  }
};

function setupEventListeners() {
  // Filter student form
  const filterBtn = document.getElementById('apply-filter-btn');
  if (filterBtn) {
    filterBtn.addEventListener('click', () => loadStudentsList());
  }

  // Attendance Form
  const attForm = document.getElementById('mark-attendance-form');
  if (attForm) {
    attForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const studentId = document.getElementById('att-student-select').value;
      const subjectId = document.getElementById('att-subject-select').value;
      const date = document.getElementById('att-date-input').value;
      const status = document.getElementById('att-status-select').value;

      if (!studentId || !subjectId) {
        showToast('Please select both student and subject.', 'warning');
        return;
      }

      try {
        const resp = await api.post('/faculty/attendance', { studentId, subjectId, date, status });
        showToast(resp.message || 'Attendance saved!', 'success');
        await loadStudentsList();
      } catch (err) {
        showToast('Error recording attendance: ' + err.message, 'error');
      }
    });
  }

  // Marks Form
  const markForm = document.getElementById('save-marks-form');
  if (markForm) {
    markForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const studentId = document.getElementById('mark-student-select').value;
      const subjectId = document.getElementById('mark-subject-select').value;
      const semester = parseInt(document.getElementById('mark-sem-input').value);
      const internalMarks = parseFloat(document.getElementById('mark-internal-input').value);
      const externalMarks = parseFloat(document.getElementById('mark-external-input').value);

      if (!studentId || !subjectId) {
        showToast('Please select student and subject.', 'warning');
        return;
      }

      try {
        const resp = await api.post('/faculty/marks', {
          studentId,
          subjectId,
          semester,
          internalMarks,
          externalMarks
        });
        showToast(resp.message || 'Marks saved successfully!', 'success');
        markForm.reset();
        await loadStudentsList();
      } catch (err) {
        showToast('Error saving marks: ' + err.message, 'error');
      }
    });
  }

  // Create Assignment Form
  const assForm = document.getElementById('create-assignment-form');
  if (assForm) {
    assForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const titleInput = document.getElementById('ass-title-input');
      const subjectSelect = document.getElementById('ass-subject-select');
      const dueInput = document.getElementById('ass-due-input');
      const maxMarksInput = document.getElementById('ass-max-input');
      const descInput = document.getElementById('ass-desc-input');

      const title = titleInput ? titleInput.value.trim() : '';
      const subjectIdVal = subjectSelect ? subjectSelect.value : '';
      const dueDate = dueInput ? dueInput.value : '';
      const maxMarks = maxMarksInput ? parseFloat(maxMarksInput.value) : 100;
      const description = descInput ? descInput.value.trim() : '';

      if (!title) {
        showToast('Please enter an assignment title.', 'warning');
        return;
      }

      if (!subjectIdVal || subjectIdVal === '') {
        showToast('Please select a course subject from the dropdown.', 'warning');
        return;
      }

      if (!dueDate) {
        showToast('Please select a due date for the assignment.', 'warning');
        return;
      }

      const submitBtn = assForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';
      }

      try {
        const resp = await api.post('/faculty/assignments', {
          title,
          subjectId: parseInt(subjectIdVal, 10),
          dueDate,
          maxMarks: isNaN(maxMarks) || maxMarks <= 0 ? 100 : maxMarks,
          description
        });
        showToast(resp.message || 'Assignment created successfully!', 'success');
        closeAssignmentModal();
        assForm.reset();
        await loadFacultyAssignments();
        await loadFacultyDashboard();
      } catch (err) {
        showToast('Failed to create assignment: ' + err.message, 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Create Assignment';
        }
      }
    });
  }

  // Grade Submission Form
  const gradeForm = document.getElementById('submit-grade-form');
  if (gradeForm) {
    gradeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!activeSubmissionId) return;

      const marksObtained = parseFloat(document.getElementById('grade-marks-input').value);
      const feedback = document.getElementById('grade-feedback-input').value.trim();

      try {
        const resp = await api.post(`/faculty/submissions/${activeSubmissionId}/grade`, {
          marksObtained,
          feedback
        });
        showToast(resp.message || 'Grade recorded!', 'success');
        closeGradeModal();
        await loadFacultyDashboard();
      } catch (err) {
        showToast('Failed to save grade: ' + err.message, 'error');
      }
    });
  }

  // Edit Faculty Profile Form
  const profForm = document.getElementById('faculty-profile-form');
  if (profForm) {
    profForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('prof-name').value.trim();
      const phone = document.getElementById('prof-phone').value.trim();
      const designation = document.getElementById('prof-desig').value.trim();
      const department = document.getElementById('prof-dept').value.trim();

      try {
        await api.put('/faculty/profile', { fullName, phone, designation, department });
        showToast('Profile updated successfully!', 'success');
        await loadFacultyDashboard();
      } catch (err) {
        showToast('Profile update failed: ' + err.message, 'error');
      }
    });
  }

  // Change Password Form
  const passForm = document.getElementById('faculty-password-form');
  if (passForm) {
    passForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentPassword = document.getElementById('current-password').value;
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-new-password').value;

      if (newPassword !== confirmPassword) {
        showToast('New passwords do not match.', 'error');
        return;
      }

      try {
        const resp = await api.put('/faculty/password', { currentPassword, newPassword, confirmPassword });
        showToast(resp.message || 'Password changed successfully!', 'success');
        passForm.reset();
      } catch (err) {
        showToast(err.message || 'Password update failed.', 'error');
      }
    });
  }

  // Class Notice Form
  const noticeForm = document.getElementById('faculty-notice-form');
  if (noticeForm) {
    noticeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('notice-title').value.trim();
      const message = document.getElementById('notice-message').value.trim();
      const yearVal = document.getElementById('notice-year').value;
      const year = yearVal ? parseInt(yearVal) : null;
      const section = document.getElementById('notice-section').value.trim() || null;
      const type = document.getElementById('notice-type').value;

      try {
        const resp = await api.post('/faculty/notices', { title, message, year, section, type });
        showToast(resp.message || 'Class notice published!', 'success');
        noticeForm.reset();
        const alertBox = document.getElementById('faculty-notice-alert');
        if (alertBox) {
          alertBox.style.display = 'block';
          alertBox.style.background = 'var(--success-light)';
          alertBox.style.color = 'var(--success)';
          alertBox.textContent = `✓ Notice "${title}" sent to students successfully!`;
        }
      } catch (err) {
        showToast('Failed to send notice: ' + err.message, 'error');
      }
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

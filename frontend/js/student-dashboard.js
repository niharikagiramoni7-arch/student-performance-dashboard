/**
 * Student Dashboard Logic
 */

let studentData = null;

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Enforce Authentication & Role Guard
  if (!auth.requireRole('ROLE_STUDENT')) return;

  // 2. Initialize Notifications & Role Switcher
  notifications.init();
  auth.renderRoleSwitcher('role-switcher-container', 'ROLE_STUDENT');

  // 3. Navigation Tab Switching
  setupNavigation();

  // 4. Load Dashboard Data
  await loadDashboard();

  // 5. Setup Action Listeners
  setupFormListeners();
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
          dashboard: 'Student Dashboard',
          attendance: 'Attendance Management',
          marks: 'Academic Marks & Grades',
          assignments: 'Coursework & Assignments',
          performance: 'Performance Analytics',
          profile: 'Student Profile & Settings'
        };
        pageTitle.textContent = titles[tab] || 'Dashboard';
      }

      // Render charts if tab is activated
      if (tab === 'performance' && studentData) {
        renderPerformanceCharts(studentData);
      } else if (tab === 'marks' && studentData) {
        renderMarksChart(studentData);
      } else if (tab === 'attendance' && studentData) {
        renderAttendanceChart(studentData);
      }

      // Close mobile sidebar
      document.querySelector('.sidebar').classList.remove('open');
    });
  });

  // Mobile menu toggle
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

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => auth.logout());
  }
}

async function loadDashboard() {
  try {
    studentData = await api.get('/student/dashboard');
    renderStudentHeader(studentData);
    renderDashboardOverview(studentData);
    renderAttendanceSection(studentData);
    renderMarksSection(studentData);
    renderAssignmentsSection(studentData);
    renderProfileSection(studentData);
  } catch (err) {
    showToast('Failed to load student data: ' + err.message, 'error');
  }
}

function renderStudentHeader(data) {
  const p = data.profile;
  document.getElementById('header-student-name').textContent = p.fullName;
  document.getElementById('header-student-id').textContent = p.studentId;
  document.getElementById('user-avatar-initial').textContent = p.fullName.charAt(0);
}

function renderDashboardOverview(data) {
  const cgpaEl = document.getElementById('stat-cgpa');
  const attEl = document.getElementById('stat-attendance');
  const subEl = document.getElementById('stat-subjects');
  const pendEl = document.getElementById('stat-pending');

  if (cgpaEl) cgpaEl.textContent = Number(data.currentCgpa).toFixed(2);
  if (attEl) attEl.textContent = `${data.attendance.percentage}%`;
  if (subEl) subEl.textContent = data.totalSubjects;
  if (pendEl) pendEl.textContent = data.pendingAssignments;

  // Attendance Overview Alert
  const attWarningEl = document.getElementById('overview-attendance-warning');
  if (attWarningEl) {
    if (data.attendance.warning) {
      attWarningEl.style.display = 'flex';
      attWarningEl.innerHTML = `⚠️ <strong>Low Attendance Warning:</strong> Your overall attendance is ${data.attendance.percentage}%. Maintain at least 75% to avoid exam detention.`;
    } else {
      attWarningEl.style.display = 'none';
    }
  }

  // Recent Marks Table
  const recentMarksBody = document.getElementById('recent-marks-body');
  if (recentMarksBody) {
    if (data.recentMarks.length === 0) {
      recentMarksBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No marks published yet.</td></tr>';
    } else {
      recentMarksBody.innerHTML = data.recentMarks.slice(0, 5).map(m => `
        <tr>
          <td><strong>${escapeHtml(m.subjectCode)}</strong> - ${escapeHtml(m.subjectName)}</td>
          <td>${m.internalMarks} / 40</td>
          <td>${m.externalMarks} / 60</td>
          <td><strong>${m.totalMarks} / 100</strong></td>
          <td><span class="badge ${getGradeBadge(m.grade)}">${m.grade} (${m.gradePoint})</span></td>
        </tr>
      `).join('');
    }
  }

  // Recent Assignments Table
  const recentAssBody = document.getElementById('recent-assignments-body');
  if (recentAssBody) {
    if (data.recentAssignments.length === 0) {
      recentAssBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No active assignments.</td></tr>';
    } else {
      recentAssBody.innerHTML = data.recentAssignments.slice(0, 5).map(a => `
        <tr>
          <td><strong>${escapeHtml(a.title)}</strong><br><small style="color: var(--text-muted);">${escapeHtml(a.subjectName)}</small></td>
          <td>${a.dueDate}</td>
          <td><span class="badge ${getStatusBadge(a.submissionStatus)}">${a.submissionStatus}</span></td>
          <td>
            ${a.submissionStatus === 'PENDING' ?
              `<button class="btn btn-primary btn-sm" onclick="openSubmitModal(${a.id}, '${escapeHtml(a.title)}')">Submit</button>` :
              `<span style="color: var(--success); font-weight: 600; font-size: 0.8rem;">Submitted</span>`}
          </td>
        </tr>
      `).join('');
    }
  }

  // Overview Progress Highlights
  const strengthsEl = document.getElementById('overview-strengths');
  if (strengthsEl) {
    strengthsEl.innerHTML = data.academicStrengths.map(s => `
      <li style="margin-bottom: 0.5rem;">🌟 ${escapeHtml(s)}</li>
    `).join('');
  }

  const improvementsEl = document.getElementById('overview-improvements');
  if (improvementsEl) {
    improvementsEl.innerHTML = data.areasForImprovement.map(i => `
      <li style="margin-bottom: 0.5rem;">🎯 ${escapeHtml(i)}</li>
    `).join('');
  }
}

function renderAttendanceSection(data) {
  const att = data.attendance;
  document.getElementById('att-overall-pct').textContent = `${att.percentage}%`;
  document.getElementById('att-total-classes').textContent = att.totalClasses;
  document.getElementById('att-attended-classes').textContent = att.attendedClasses;
  document.getElementById('att-absent-classes').textContent = att.absentClasses;

  const progressBar = document.getElementById('att-overall-bar');
  if (progressBar) {
    progressBar.style.width = `${Math.min(att.percentage, 100)}%`;
    progressBar.className = `progress-bar-fill ${att.percentage < 75 ? 'progress-danger' : 'progress-success'}`;
  }

  const attTable = document.getElementById('subject-attendance-body');
  if (attTable) {
    attTable.innerHTML = att.subjectBreakdown.map(s => `
      <tr>
        <td><strong>${escapeHtml(s.subjectCode)}</strong> - ${escapeHtml(s.subjectName)}</td>
        <td>${s.totalClasses}</td>
        <td><span style="color: var(--success); font-weight: 700;">${s.attendedClasses}</span></td>
        <td><span style="color: var(--danger); font-weight: 700;">${s.absentClasses}</span></td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="progress-bar-bg" style="width: 100px;">
              <div class="progress-bar-fill ${s.warning ? 'progress-danger' : 'progress-success'}" style="width: ${Math.min(s.percentage, 100)}%;"></div>
            </div>
            <strong>${s.percentage}%</strong>
          </div>
        </td>
        <td>
          ${s.warning ?
            `<span class="badge badge-danger">⚠️ Warning &lt; 75%</span>` :
            `<span class="badge badge-success">Good Standing</span>`}
        </td>
      </tr>
    `).join('');
  }
}

function renderMarksSection(data) {
  const marksBody = document.getElementById('marks-table-body');
  if (marksBody) {
    if (data.recentMarks.length === 0) {
      marksBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No marks recorded.</td></tr>';
    } else {
      marksBody.innerHTML = data.recentMarks.map(m => `
        <tr>
          <td>Semester ${m.semester}</td>
          <td><strong>${escapeHtml(m.subjectCode)}</strong></td>
          <td>${escapeHtml(m.subjectName)}</td>
          <td>${m.internalMarks}</td>
          <td>${m.externalMarks}</td>
          <td><strong>${m.totalMarks}</strong></td>
          <td><span class="badge ${getGradeBadge(m.grade)}">${m.grade}</span> (${m.gradePoint})</td>
        </tr>
      `).join('');
    }
  }
}

function renderAssignmentsSection(data) {
  const assBody = document.getElementById('all-assignments-body');
  if (assBody) {
    if (data.recentAssignments.length === 0) {
      assBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No assignments available.</td></tr>';
    } else {
      assBody.innerHTML = data.recentAssignments.map(a => `
        <tr>
          <td>
            <strong>${escapeHtml(a.title)}</strong>
            <p style="font-size: 0.8rem; margin-top: 2px;">${escapeHtml(a.description || 'No description.')}</p>
          </td>
          <td>${escapeHtml(a.subjectCode)} - ${escapeHtml(a.subjectName)}</td>
          <td>${a.assignedDate}</td>
          <td><strong style="color: ${isOverdue(a.dueDate) ? 'var(--danger)' : 'var(--text-main)'};">${a.dueDate}</strong></td>
          <td><span class="badge ${getStatusBadge(a.submissionStatus)}">${a.submissionStatus}</span></td>
          <td>${a.marksObtained != null ? `<strong>${a.marksObtained}</strong> / ${a.maxMarks}` : '<span style="color: var(--text-muted);">Pending</span>'}</td>
          <td>
            ${a.submissionStatus === 'PENDING' ?
              `<button class="btn btn-primary btn-sm" onclick="openSubmitModal(${a.id}, '${escapeHtml(a.title)}')">Submit Now</button>` :
              `<span style="color: var(--success); font-weight: 600; font-size: 0.85rem;">Submitted</span>`}
          </td>
        </tr>
      `).join('');
    }
  }
}

function renderProfileSection(data) {
  const p = data.profile;
  document.getElementById('prof-name').value = p.fullName;
  document.getElementById('prof-id').value = p.studentId;
  document.getElementById('prof-email').value = p.email;
  document.getElementById('prof-phone').value = p.phone || '';
  document.getElementById('prof-dept').value = p.department;
  document.getElementById('prof-year').value = p.year;
  document.getElementById('prof-section').value = p.section;
  document.getElementById('prof-cgpa-display').textContent = Number(p.currentCgpa).toFixed(2);
}

// Charts
function renderMarksChart(data) {
  const labels = data.recentMarks.map(m => m.subjectCode);
  const scores = data.recentMarks.map(m => m.totalMarks);
  spdCharts.renderBarChart('marksChartCanvas', labels, scores, 'Total Marks / 100', '#4f46e5');
}

function renderAttendanceChart(data) {
  const attended = data.attendance.attendedClasses;
  const absent = data.attendance.absentClasses;
  spdCharts.renderDoughnutChart('attendanceChartCanvas', ['Attended Classes', 'Absent Classes'], [attended, absent], ['#10b981', '#ef4444']);
}

function renderPerformanceCharts(data) {
  // 1. CGPA Line Chart
  const semLabels = data.semesterGpaHistory.map(s => `Semester ${s.semester}`);
  const semGpas = data.semesterGpaHistory.map(s => s.gpa);
  if (semLabels.length === 0) {
    semLabels.push('Sem 1', 'Sem 2', 'Sem 3', 'Current');
    semGpas.push(8.2, 8.5, 8.7, Number(data.currentCgpa));
  }
  spdCharts.renderLineChart('cgpaTrendCanvas', semLabels, semGpas, 'Semester GPA Trend', '#4f46e5');

  // 2. Marks Bar Chart
  const marksLabels = data.recentMarks.map(m => m.subjectCode);
  const marksScores = data.recentMarks.map(m => m.totalMarks);
  spdCharts.renderBarChart('perfMarksCanvas', marksLabels, marksScores, 'Subject Marks', '#0ea5e9');

  // 3. Attendance Chart
  spdCharts.renderDoughnutChart('perfAttendanceCanvas', ['Attended', 'Absent'], [data.attendance.attendedClasses, data.attendance.absentClasses], ['#10b981', '#ef4444']);

  // 4. Assignment Status Chart
  const submittedCount = data.recentAssignments.filter(a => a.submissionStatus === 'SUBMITTED').length;
  const pendingCount = data.recentAssignments.filter(a => a.submissionStatus === 'PENDING').length;
  const lateCount = data.recentAssignments.filter(a => a.submissionStatus === 'LATE').length;
  spdCharts.renderDoughnutChart('perfAssignmentCanvas', ['Submitted', 'Pending', 'Late'], [submittedCount, pendingCount, lateCount], ['#10b981', '#f59e0b', '#ef4444']);
}

// Modal handling for assignment submissions
let activeAssignmentId = null;
window.openSubmitModal = function(assignmentId, title) {
  activeAssignmentId = assignmentId;
  document.getElementById('modal-assignment-title').textContent = title;
  document.getElementById('submission-notes').value = '';
  document.getElementById('submission-link').value = '';
  document.getElementById('submission-modal').classList.add('show');
};

window.closeSubmitModal = function() {
  document.getElementById('submission-modal').classList.remove('show');
  activeAssignmentId = null;
};

function setupFormListeners() {
  // Submission Form
  const subForm = document.getElementById('assignment-submit-form');
  if (subForm) {
    subForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!activeAssignmentId) return;

      const submissionText = document.getElementById('submission-notes').value.trim();
      const fileUrl = document.getElementById('submission-link').value.trim();

      try {
        const resp = await api.post(`/student/assignments/${activeAssignmentId}/submit`, {
          submissionText,
          fileUrl
        });

        showToast(resp.message || 'Assignment submitted successfully!', 'success');
        closeSubmitModal();
        await loadDashboard();
      } catch (err) {
        showToast('Submission error: ' + err.message, 'error');
      }
    });
  }

  // Edit Profile Form
  const profileForm = document.getElementById('student-profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('prof-name').value.trim();
      const phone = document.getElementById('prof-phone').value.trim();
      const department = document.getElementById('prof-dept').value.trim();
      const year = parseInt(document.getElementById('prof-year').value);
      const section = document.getElementById('prof-section').value.trim();

      try {
        await api.put('/student/profile', { fullName, phone, department, year, section });
        showToast('Profile updated successfully!', 'success');
        await loadDashboard();
      } catch (err) {
        showToast('Failed to update profile: ' + err.message, 'error');
      }
    });
  }

  // Change Password Form
  const passForm = document.getElementById('student-password-form');
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
        const resp = await api.put('/student/password', { currentPassword, newPassword, confirmPassword });
        showToast(resp.message || 'Password changed successfully!', 'success');
        passForm.reset();
      } catch (err) {
        showToast(err.message || 'Password update failed.', 'error');
      }
    });
  }
}

// Utility formatting
function getGradeBadge(grade) {
  if (grade === 'A+' || grade === 'O') return 'badge-success';
  if (grade === 'A') return 'badge-primary';
  if (grade === 'B+' || grade === 'B') return 'badge-secondary';
  if (grade === 'C' || grade === 'P') return 'badge-warning';
  return 'badge-danger';
}

function getStatusBadge(status) {
  if (status === 'SUBMITTED') return 'badge-success';
  if (status === 'LATE') return 'badge-danger';
  return 'badge-warning';
}

function isOverdue(dueDate) {
  return new Date(dueDate) < new Date();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

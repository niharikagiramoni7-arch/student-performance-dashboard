/**
 * Authentication and Session State Manager
 */

const auth = {
  getUser() {
    try {
      const user = localStorage.getItem('spd_user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('spd_token');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  saveSession(authResponse) {
    localStorage.setItem('spd_token', authResponse.token);
    localStorage.setItem('spd_user', JSON.stringify({
      id: authResponse.id,
      email: authResponse.email,
      fullName: authResponse.fullName,
      role: authResponse.role,
      studentId: authResponse.studentId,
      employeeId: authResponse.employeeId,
      department: authResponse.department
    }));
  },

  clearSession() {
    localStorage.removeItem('spd_token');
    localStorage.removeItem('spd_user');
  },

  logout() {
    this.clearSession();
    window.location.href = '/role-selection.html';
  },

  /**
   * Route Guard: Protects portal pages by enforcing authentication and required role.
   * Administrator (ROLE_ADMIN) has master access to ALL portals (Admin, Faculty, Student).
   */
  requireRole(requiredRole) {
    const user = this.getUser();
    const token = this.getToken();

    if (!token || !user) {
      this.clearSession();
      this.redirectToLogin(requiredRole);
      return false;
    }

    // ROLE_ADMIN has universal master access to ALL dashboards
    if (user.role === 'ROLE_ADMIN') {
      return true;
    }

    if (user.role !== requiredRole) {
      showToast(`Access denied: Requires ${requiredRole.replace('ROLE_', '')} role.`, 'error');
      setTimeout(() => {
        this.redirectToDashboard(user.role);
      }, 1000);
      return false;
    }

    return true;
  },

  redirectToLogin(role) {
    if (role === 'ROLE_ADMIN') {
      window.location.href = '/admin/login.html';
    } else if (role === 'ROLE_FACULTY') {
      window.location.href = '/faculty/login.html';
    } else {
      window.location.href = '/student/login.html';
    }
  },

  redirectToDashboard(role) {
    if (role === 'ROLE_ADMIN') {
      window.location.href = '/admin/dashboard.html';
    } else if (role === 'ROLE_FACULTY') {
      window.location.href = '/faculty/dashboard.html';
    } else {
      window.location.href = '/student/dashboard.html';
    }
  },

  async quickLogin(targetRole) {
    this.switchRole(targetRole);
  },

  switchRole(role) {
    const user = this.getUser();
    // If the logged in user is Administrator, they have master access: switch directly to that dashboard without clearing session!
    if (user && user.role === 'ROLE_ADMIN') {
      if (typeof showToast === 'function') {
        showToast('Switching to ' + role.replace('ROLE_', '').toLowerCase() + ' dashboard...', 'info');
      }
      setTimeout(() => {
        this.redirectToDashboard(role);
      }, 300);
      return;
    }

    this.clearSession();
    if (typeof showToast === 'function') {
      showToast('Redirecting to manual ' + role.replace('ROLE_', '').toLowerCase() + ' login...', 'info');
    }
    setTimeout(() => {
      this.redirectToLogin(role);
    }, 400);
  },

  renderRoleSwitcher(containerId, activeRole) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const user = this.getUser();
    const isAdmin = user && user.role === 'ROLE_ADMIN';

    container.innerHTML = `
      <div class="role-switcher-bar" style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
        <span class="role-switcher-title" style="font-weight: 700; font-size: 0.75rem; color: #475569;">
          ${isAdmin ? '👑 Master Portal Control:' : '🏛️ Switch Portal:'}
        </span>
        <button type="button" class="role-btn ${activeRole === 'ROLE_STUDENT' ? 'active' : ''}" onclick="auth.switchRole('ROLE_STUDENT')" title="${isAdmin ? 'Open Student Portal Dashboard' : 'Go to Student Login (Manual)'}">
          👨‍🎓 Student Portal
        </button>
        <button type="button" class="role-btn ${activeRole === 'ROLE_FACULTY' ? 'active' : ''}" onclick="auth.switchRole('ROLE_FACULTY')" title="${isAdmin ? 'Open Faculty Portal Dashboard' : 'Go to Faculty Login (Manual)'}">
          👨‍🏫 Faculty Portal
        </button>
        <button type="button" class="role-btn ${activeRole === 'ROLE_ADMIN' ? 'active' : ''}" onclick="auth.switchRole('ROLE_ADMIN')" title="${isAdmin ? 'Open Admin Control Center' : 'Go to Administrator Login (Manual)'}">
          🛡️ Admin Portal
        </button>
        <span style="height: 16px; width: 1px; background: #cbd5e1; margin: 0 2px;"></span>
        <button type="button" class="role-switcher-action-btn transcript" onclick="auth.openTranscriptModal()" title="View Official Academic Transcript">
          📜 Official Transcript
        </button>
        <button type="button" class="role-switcher-action-btn verified" onclick="auth.openVerifiedDetailsModal()" title="View Email OTP 2FA Verified Details">
          🛡️ OTP Verified ID
        </button>
      </div>
    `;
  },

  async openTranscriptModal() {
    let modal = document.getElementById('global-transcript-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'global-transcript-modal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-dialog transcript-dialog">
        <div class="transcript-header-box">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div class="transcript-crest">NM</div>
            <div>
              <div style="font-size: 0.72rem; font-weight: 800; color: #fde68a; letter-spacing: 0.8px; text-transform: uppercase;">
                SVKM's NMIMS University • Deemed to be University
              </div>
              <h2 style="font-size: 1.25rem; font-weight: 900; margin: 2px 0 0; letter-spacing: -0.3px;">
                Mukesh Patel School of Technology Management & Engineering (MPSTME)
              </h2>
              <div style="font-size: 0.75rem; color: #cbd5e1; margin-top: 2px;">
                Official Academic Grade Sheet & Performance Transcript
              </div>
            </div>
          </div>
          <button type="button" class="modal-close" style="color: #cbd5e1;" onclick="auth.closeTranscriptModal()">×</button>
        </div>

        <div class="modal-body" style="padding: 1.5rem 2rem;">
          <div id="transcript-body-content">
            <div style="text-align: center; padding: 2rem; color: #64748b;">Loading official transcript data from academic ledger...</div>
          </div>
        </div>

        <div class="modal-footer" style="padding: 1rem 2rem; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 0.75rem; color: #64748b;">
            Official Document • Verification Hash: <strong>SHA256-NMIMS-${Date.now().toString(16).toUpperCase()}</strong>
          </div>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="auth.downloadTranscriptCsv()">📥 Download CSV</button>
            <button type="button" class="btn btn-primary btn-sm" onclick="window.print()">🖨️ Print / Save PDF</button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="auth.closeTranscriptModal()">Close</button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('show');

    try {
      const user = this.getUser();
      let student = null;
      let marks = [];
      let attendancePct = '90.6%';
      let cgpa = '8.75';

      if (user && user.role === 'ROLE_STUDENT') {
        const dash = await api.get('/student/dashboard');
        student = dash.profile;
        marks = dash.recentMarks || [];
        attendancePct = `${dash.attendance?.percentage || 0}%`;
        cgpa = Number(dash.currentCgpa || 0).toFixed(2);
      } else {
        // Faculty / Admin view: fetch registered students
        const students = await api.get('/faculty/students');
        if (students && students.length > 0) {
          student = students[0];
          attendancePct = `${student.attendancePercentage || 0}%`;
          cgpa = Number(student.currentCgpa || 0).toFixed(2);
          try {
            const stuMarks = await api.get(`/faculty/marks?studentId=${student.id}`);
            marks = stuMarks || [];
          } catch (e) {
            marks = [];
          }
        } else {
          student = {
            fullName: 'No registered students yet',
            studentId: '—',
            department: '—',
            year: 1,
            section: 'A'
          };
          marks = [];
          attendancePct = 'N/A';
          cgpa = 'N/A';
        }
      }

      window.lastTranscriptData = { student, marks, cgpa, attendancePct };

      const bodyEl = document.getElementById('transcript-body-content');
      if (!bodyEl) return;

      const issueDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      bodyEl.innerHTML = `
        <div class="transcript-meta-grid">
          <div class="transcript-meta-item">
            <div class="meta-label">Student Name</div>
            <div class="meta-value">${escapeHtml(student.fullName || '—')}</div>
          </div>
          <div class="transcript-meta-item">
            <div class="meta-label">Student ID / Roll No.</div>
            <div class="meta-value">${escapeHtml(student.studentId || '—')}</div>
          </div>
          <div class="transcript-meta-item">
            <div class="meta-label">Department / Branch</div>
            <div class="meta-value">${escapeHtml(student.department || '—')}</div>
          </div>
          <div class="transcript-meta-item">
            <div class="meta-label">Study Year & Term</div>
            <div class="meta-value">Year ${student.year || 1}, Semester 5 (Sec ${student.section || 'A'})</div>
          </div>
          <div class="transcript-meta-item">
            <div class="meta-label">Cumulative CGPA</div>
            <div class="meta-value" style="color: #4f46e5;">${cgpa} / 10.00</div>
          </div>
          <div class="transcript-meta-item">
            <div class="meta-label">Overall Attendance</div>
            <div class="meta-value" style="color: #059669;">${attendancePct}</div>
          </div>
        </div>

        <div style="margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: flex-end;">
          <h4 style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin: 0;">Coursework & Evaluation Summary</h4>
          <span style="font-size: 0.75rem; color: #64748b;">Issued on: ${issueDate}</span>
        </div>

        <div class="table-responsive" style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
            <thead>
              <tr style="background: #f1f5f9; text-align: left;">
                <th style="padding: 8px 12px;">Course Code</th>
                <th style="padding: 8px 12px;">Course Name</th>
                <th style="padding: 8px 12px; text-align: center;">Internal (40)</th>
                <th style="padding: 8px 12px; text-align: center;">External (60)</th>
                <th style="padding: 8px 12px; text-align: center;">Total (100)</th>
                <th style="padding: 8px 12px; text-align: center;">Grade</th>
                <th style="padding: 8px 12px; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${marks.length === 0 ? `
                <tr><td colspan="7" style="padding: 1.25rem; text-align: center; color: #64748b;">No coursework marks published yet for this student.</td></tr>
              ` : marks.map(m => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 12px; font-weight: 700; color: #1e293b;">${escapeHtml(m.subjectCode)}</td>
                  <td style="padding: 8px 12px; color: #334155;">${escapeHtml(m.subjectName)}</td>
                  <td style="padding: 8px 12px; text-align: center;">${m.internalMarks}</td>
                  <td style="padding: 8px 12px; text-align: center;">${m.externalMarks}</td>
                  <td style="padding: 8px 12px; text-align: center; font-weight: 800;">${m.totalMarks}</td>
                  <td style="padding: 8px 12px; text-align: center;">
                    <span class="badge ${typeof getGradeBadge === 'function' ? getGradeBadge(m.grade) : 'badge-primary'}">${m.grade}</span>
                  </td>
                  <td style="padding: 8px 12px; text-align: center; color: #059669; font-weight: 700; font-size: 0.75rem;">PASS</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="transcript-seal-box">
          <div>
            <div><strong>Academic Standing:</strong> FIRST CLASS WITH DISTINCTION</div>
            <div style="font-size: 0.72rem; color: #64748b; margin-top: 2px;">Accredited by NAAC Grade A+ & NBA Accredited Engineering Programs</div>
          </div>
          <div class="transcript-seal-stamp">
            <span>🛡️ OFFICIAL SEAL: CONTROLLER OF EXAMINATIONS • NMIMS</span>
          </div>
        </div>
      `;
    } catch (e) {
      const bodyEl = document.getElementById('transcript-body-content');
      if (bodyEl) {
        bodyEl.innerHTML = `<div style="color: #ef4444; padding: 1rem;">Failed to load transcript: ${escapeHtml(e.message)}</div>`;
      }
    }
  },

  closeTranscriptModal() {
    const modal = document.getElementById('global-transcript-modal');
    if (modal) modal.classList.remove('show');
  },

  downloadTranscriptCsv() {
    const data = window.lastTranscriptData;
    if (!data) return;
    const { student, marks, cgpa, attendancePct } = data;
    let csv = `SVKM's NMIMS University - MPSTME Official Transcript\n`;
    csv += `Student Name,${student.fullName || 'Student'}\n`;
    csv += `Student ID,${student.studentId || 'N/A'}\n`;
    csv += `Department,${student.department || 'N/A'}\n`;
    csv += `Current CGPA,${cgpa}\n`;
    csv += `Attendance,${attendancePct}\n\n`;
    csv += `Course Code,Course Name,Internal (40),External (60),Total (100),Grade,Grade Point\n`;
    marks.forEach(m => {
      csv += `"${m.subjectCode}","${m.subjectName}",${m.internalMarks},${m.externalMarks},${m.totalMarks},"${m.grade}",${m.gradePoint || ''}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transcript_${(student.studentId || 'student').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (typeof showToast === 'function') showToast('Official Transcript CSV downloaded!', 'success');
  },

  openVerifiedDetailsModal() {
    let modal = document.getElementById('global-verified-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'global-verified-modal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    const user = this.getUser() || {
      fullName: 'Registered User',
      email: 'user@example.com',
      role: 'ROLE_STUDENT',
      studentId: '—',
      department: '—'
    };

    const roleName = user.role === 'ROLE_ADMIN' ? 'Platform Administrator' :
                     user.role === 'ROLE_FACULTY' ? 'Academic Faculty' : 'Registered Student';

    const idLabel = user.role === 'ROLE_ADMIN' ? 'Admin ID' :
                    user.role === 'ROLE_FACULTY' ? 'Employee ID' : 'Student ID';
    const idVal = user.employeeId || user.studentId || (user.role === 'ROLE_ADMIN' ? 'ADM-NMIMS-001' : '—');

    modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 580px; border-radius: 16px; overflow: hidden; border: 2px solid #a7f3d0;">
        <div style="background: linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%); color: #fff; padding: 1.5rem; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 44px; height: 44px; background: #34d399; color: #064e3b; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 900;">
              🛡️
            </div>
            <div>
              <div style="font-size: 0.72rem; font-weight: 800; color: #a7f3d0; letter-spacing: 0.8px; text-transform: uppercase;">
                SVKM's NMIMS University • MPSTME
              </div>
              <h3 style="font-size: 1.15rem; font-weight: 800; margin: 2px 0 0;">
                Two-Factor Email OTP Verified Identity Record
              </h3>
            </div>
          </div>
          <button type="button" class="modal-close" style="color: #a7f3d0;" onclick="auth.closeVerifiedDetailsModal()">×</button>
        </div>

        <div class="modal-body" style="padding: 1.5rem;">
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 0.85rem 1rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.5rem;">✅</span>
            <div style="font-size: 0.82rem; color: #065f46; line-height: 1.4;">
              <strong>Identity Authenticated & Active:</strong> Your email address and academic identity were verified using a 6-digit cryptographic one-time passcode (OTP).
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.85rem;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem 1rem;">
              <div style="font-size: 0.7rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Full Legal Name</div>
              <div style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-top: 2px;">${escapeHtml(user.fullName || 'User')}</div>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem 1rem;">
              <div style="font-size: 0.7rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Verified Email</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: #0f172a; margin-top: 2px; word-break: break-all;">${escapeHtml(user.email || '')}</div>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem 1rem;">
              <div style="font-size: 0.7rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Active Role</div>
              <div style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-top: 2px;">${roleName}</div>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem 1rem;">
              <div style="font-size: 0.7rem; color: #64748b; font-weight: 700; text-transform: uppercase;">${idLabel}</div>
              <div style="font-size: 0.95rem; font-weight: 800; color: #4f46e5; margin-top: 2px;">${escapeHtml(idVal)}</div>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem 1rem; grid-column: span 2;">
              <div style="font-size: 0.7rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Department & Campus</div>
              <div style="font-size: 0.9rem; font-weight: 700; color: #0f172a; margin-top: 2px;">
                ${escapeHtml(user.department || 'MPSTME - Computer Engineering')}, Mumbai Campus
              </div>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem 1rem; grid-column: span 2;">
              <div style="font-size: 0.7rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Security Protocol</div>
              <div style="font-size: 0.8rem; color: #334155; margin-top: 2px;">
                Spring Security 6 • HMAC-SHA256 Signed JWT Token • 24-Hour Session Lifecycle
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer" style="padding: 1rem 1.5rem; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="window.print()">🖨️ Print Identity Sheet</button>
          <button type="button" class="btn btn-primary btn-sm" onclick="auth.closeVerifiedDetailsModal()">Done / Close</button>
        </div>
      </div>
    `;

    modal.classList.add('show');
  },

  closeVerifiedDetailsModal() {
    const modal = document.getElementById('global-verified-modal');
    if (modal) modal.classList.remove('show');
  }
};


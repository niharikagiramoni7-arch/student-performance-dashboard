/**
 * Academic Report Generator & Export Engine
 */

const reportsManager = {
  currentReport: null,

  async generate() {
    const reportType = document.getElementById('report-type-select').value;
    const department = document.getElementById('report-dept-select').value;
    const year = document.getElementById('report-year-select').value;
    const semester = document.getElementById('report-sem-select').value;
    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;

    const payload = {
      reportType,
      department: department || null,
      year: year ? parseInt(year) : null,
      semester: semester ? parseInt(semester) : null,
      startDate: startDate || null,
      endDate: endDate || null
    };

    const generateBtn = document.getElementById('generate-report-btn');
    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.textContent = 'Generating...';
    }

    try {
      this.currentReport = await api.post('/admin/reports', payload);
      this.renderReportPreview(this.currentReport);
      showToast('Report generated successfully!', 'success');
    } catch (err) {
      showToast('Report error: ' + err.message, 'error');
    } finally {
      if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.textContent = '📊 Generate Report';
      }
    }
  },

  renderReportPreview(report) {
    const container = document.getElementById('report-results-container');
    if (!container) return;

    if (!report || !report.rows || report.rows.length === 0) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 3rem;">
          <h3>${escapeHtml(report.title)}</h3>
          <p style="margin-top: 0.5rem; color: var(--text-muted);">No records found matching the specified filters.</p>
        </div>
      `;
      return;
    }

    // Summary Cards
    let summaryHtml = '';
    if (report.summaryStats) {
      summaryHtml = '<div class="grid-4" style="margin-bottom: 1.5rem;">' +
        Object.entries(report.summaryStats).map(([key, val]) => `
          <div class="card" style="padding: 1rem 1.25rem;">
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary);">${escapeHtml(String(val))}</div>
            <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 600; color: var(--text-muted); margin-top: 2px;">${escapeHtml(key)}</div>
          </div>
        `).join('') +
      '</div>';
    }

    // Table Columns & Rows
    const tableHeaderHtml = report.columns.map(c => `<th>${escapeHtml(c)}</th>`).join('');
    const tableRowsHtml = report.rows.map(row => `
      <tr>
        ${row.map(cell => `<td>${escapeHtml(cell || '-')}</td>`).join('')}
      </tr>
    `).join('');

    container.innerHTML = `
      <div class="card" style="margin-bottom: 1rem;">
        <div class="card-header" style="flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 class="card-title">${escapeHtml(report.title)}</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted);">
              <strong>Filters:</strong> ${escapeHtml(report.filterSummary)} | <strong>Generated:</strong> ${escapeHtml(report.generatedAt)}
            </p>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary btn-sm" onclick="reportsManager.downloadCsv()">📥 Download CSV</button>
            <button class="btn btn-primary btn-sm" onclick="reportsManager.printReport()">🖨️ Download PDF / Print</button>
          </div>
        </div>

        ${summaryHtml}

        <div class="table-responsive">
          <table>
            <thead>
              <tr>${tableHeaderHtml}</tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async downloadCsv() {
    if (!this.currentReport) {
      showToast('Please generate a report first.', 'warning');
      return;
    }

    const reportType = document.getElementById('report-type-select').value;
    const department = document.getElementById('report-dept-select').value;
    const year = document.getElementById('report-year-select').value;
    const semester = document.getElementById('report-sem-select').value;
    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;

    const payload = {
      reportType,
      department: department || null,
      year: year ? parseInt(year) : null,
      semester: semester ? parseInt(semester) : null,
      startDate: startDate || null,
      endDate: endDate || null
    };

    try {
      await api.download('/admin/reports/csv', payload, `${reportType.toLowerCase()}_report.csv`);
      showToast('CSV downloaded successfully!', 'success');
    } catch (e) {
      showToast('CSV download failed: ' + e.message, 'error');
    }
  },

  printReport() {
    if (!this.currentReport) {
      showToast('Please generate a report first.', 'warning');
      return;
    }
    window.print();
  }
};

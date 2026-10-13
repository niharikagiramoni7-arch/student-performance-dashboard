/**
 * Chart.js Integration Helpers
 */

const chartRegistry = {};

const spdCharts = {
  destroy(canvasId) {
    if (chartRegistry[canvasId]) {
      chartRegistry[canvasId].destroy();
      delete chartRegistry[canvasId];
    }
  },

  renderLineChart(canvasId, labels, data, datasetLabel = 'CGPA Trend', color = '#4f46e5') {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    chartRegistry[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: datasetLabel,
          data: data,
          borderColor: color,
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: color,
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true,
          tension: 0.35
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          y: {
            min: 0,
            max: 10,
            ticks: { stepSize: 2 }
          },
          x: { grid: { display: false } }
        }
      }
    });

    return chartRegistry[canvasId];
  },

  renderBarChart(canvasId, labels, data, datasetLabel = 'Marks (out of 100)', color = '#0ea5e9') {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    chartRegistry[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: datasetLabel,
          data: data,
          backgroundColor: color,
          borderRadius: 6,
          maxBarThickness: 45
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: { stepSize: 20 }
          },
          x: { grid: { display: false } }
        }
      }
    });

    return chartRegistry[canvasId];
  },

  renderDoughnutChart(canvasId, labels, data, colors = ['#10b981', '#ef4444']) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    chartRegistry[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });

    return chartRegistry[canvasId];
  }
};

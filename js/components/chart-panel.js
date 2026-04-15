var App = window.App || {};
App.components = App.components || {};

(function () {
  var charts = {};

  App.components.chartPanel = {
    render: function (options) {
      var id = options.id || 'chart-' + Date.now();
      var title = options.title || '';

      return (
        '<div class="chart-panel">' +
          (title ? '<h3 class="chart-panel-title">' + title + '</h3>' : '') +
          '<div class="chart-panel-body">' +
            '<canvas id="' + id + '"></canvas>' +
          '</div>' +
        '</div>'
      );
    },

    createBarChart: function (canvasId, labels, datasets) {
      var ctx = document.getElementById(canvasId);
      if (!ctx) return null;

      if (charts[canvasId]) {
        charts[canvasId].destroy();
      }

      charts[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return '$' + value.toLocaleString();
                }
              }
            }
          }
        }
      });

      return charts[canvasId];
    },

    createPieChart: function (canvasId, labels, data, colors) {
      var ctx = document.getElementById(canvasId);
      if (!ctx) return null;

      if (charts[canvasId]) {
        charts[canvasId].destroy();
      }

      charts[canvasId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors || [
              '#0984e3', '#00b894', '#d63031', '#fdcb6e',
              '#6c5ce7', '#e17055', '#00cec9', '#fab1a0',
              '#74b9ff', '#55efc4', '#ff7675', '#ffeaa7'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { padding: 12, font: { size: 12 } }
            }
          }
        }
      });

      return charts[canvasId];
    },

    destroyAll: function () {
      Object.keys(charts).forEach(function (key) {
        charts[key].destroy();
      });
      charts = {};
    }
  };
})();

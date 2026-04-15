var App = window.App || {};
App.screens = App.screens || {};

App.screens.reports = {
  render: function () {
    var content = document.getElementById('content');
    if (!content) return;

    content.innerHTML =
      '<div class="screen">' +
        '<h2>Reports & Export</h2>' +
        '<p class="screen-description">Generate reports and export data for taxes or JobSeeker applications.</p>' +
        '<div id="reports-content">' +
          '<p style="color: var(--text-muted); text-align: center; padding: 48px;">Reports and export coming in Phase 4.</p>' +
        '</div>' +
      '</div>';
  }
};

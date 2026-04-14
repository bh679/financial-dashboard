var App = window.App || {};
App.screens = App.screens || {};

App.screens.dashboard = {
  render: function () {
    var content = document.getElementById('content');
    if (!content) return;

    content.innerHTML =
      '<div class="screen">' +
        '<h2>Dashboard</h2>' +
        '<p style="color: var(--text-muted); margin-top: 8px;">Import a Revolut CSV to get started.</p>' +
      '</div>';
  }
};

var App = window.App || {};
App.screens = App.screens || {};

App.screens.transactions = {
  render: function () {
    var content = document.getElementById('content');
    if (!content) return;

    content.innerHTML =
      '<div class="screen">' +
        '<h2>Transactions</h2>' +
        '<p class="screen-description">View and manage all imported transactions.</p>' +
        '<div id="transactions-list">' +
          '<p style="color: var(--text-muted); text-align: center; padding: 48px;">Transaction list coming in Phase 3.</p>' +
        '</div>' +
      '</div>';
  }
};

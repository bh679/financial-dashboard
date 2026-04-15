var App = window.App || {};
App.screens = App.screens || {};

App.screens.dashboard = {
  render: function () {
    var content = document.getElementById('content');
    if (!content) return;

    content.innerHTML =
      '<div class="screen">' +
        '<h2>Dashboard</h2>' +
        '<div class="cards-grid" id="summary-cards">' +
          App.components.card.render({ title: 'Total Income', value: '—', colorClass: 'success' }) +
          App.components.card.render({ title: 'Total Expenses', value: '—', colorClass: 'danger' }) +
          App.components.card.render({ title: 'Net', value: '—', colorClass: 'primary' }) +
        '</div>' +
        '<div id="dashboard-charts">' +
          '<p style="color: var(--text-muted); text-align: center; padding: 48px;">Import a Revolut CSV to see your financial data here.</p>' +
        '</div>' +
      '</div>';

    this.loadData();
  },

  loadData: function () {
    App.services.firestore.getTransactions().then(function (transactions) {
      App.setState({ transactions: transactions });

      if (transactions.length === 0) return;

      var income = 0;
      var expenses = 0;

      transactions.forEach(function (tx) {
        if (tx.type === 'income') {
          income += tx.amount;
        } else {
          expenses += tx.amount;
        }
      });

      var net = income - expenses;
      var fmt = App.utils.formatters.currency;

      var cardsEl = document.getElementById('summary-cards');
      if (cardsEl) {
        cardsEl.innerHTML =
          App.components.card.render({ title: 'Total Income', value: fmt(income), colorClass: 'success' }) +
          App.components.card.render({ title: 'Total Expenses', value: fmt(expenses), colorClass: 'danger' }) +
          App.components.card.render({ title: 'Net', value: fmt(net), colorClass: net >= 0 ? 'success' : 'danger' });
      }

      var chartsEl = document.getElementById('dashboard-charts');
      if (chartsEl) {
        chartsEl.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 24px;">' + transactions.length + ' transactions loaded. Charts coming in Phase 3.</p>';
      }
    }).catch(function (err) {
      console.error('Failed to load transactions:', err);
    });
  }
};

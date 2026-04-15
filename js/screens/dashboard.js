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
          App.components.card.render({ title: 'Total Income', value: 'Loading...', colorClass: 'success' }) +
          App.components.card.render({ title: 'Total Expenses', value: 'Loading...', colorClass: 'danger' }) +
          App.components.card.render({ title: 'Net', value: 'Loading...', colorClass: 'primary' }) +
        '</div>' +
        '<div class="charts-grid" id="dashboard-charts">' +
          App.components.chartPanel.render({ id: 'monthly-chart', title: 'Monthly Income vs Expenses' }) +
          App.components.chartPanel.render({ id: 'category-chart', title: 'Expenses by Category' }) +
        '</div>' +
      '</div>';

    this.loadData();
  },

  loadData: function () {
    App.services.firestore.getTransactions().then(function (transactions) {
      App.setState({ transactions: transactions });

      if (transactions.length === 0) {
        document.getElementById('dashboard-charts').innerHTML =
          '<div class="chart-panel" style="grid-column: 1 / -1; text-align: center; padding: 48px;">' +
            '<p style="color: var(--text-muted);">Import a Revolut CSV to see your financial charts here.</p>' +
          '</div>';

        var cardsEl = document.getElementById('summary-cards');
        if (cardsEl) {
          cardsEl.innerHTML =
            App.components.card.render({ title: 'Total Income', value: '$0.00', colorClass: 'success' }) +
            App.components.card.render({ title: 'Total Expenses', value: '$0.00', colorClass: 'danger' }) +
            App.components.card.render({ title: 'Net', value: '$0.00', colorClass: 'primary' });
        }
        return;
      }

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
          App.components.card.render({ title: 'Total Income', value: fmt(income), subtitle: transactions.filter(function (t) { return t.type === 'income'; }).length + ' transactions', colorClass: 'success' }) +
          App.components.card.render({ title: 'Total Expenses', value: fmt(expenses), subtitle: transactions.filter(function (t) { return t.type === 'expense'; }).length + ' transactions', colorClass: 'danger' }) +
          App.components.card.render({ title: 'Net', value: fmt(net), colorClass: net >= 0 ? 'success' : 'danger' });
      }

      App.screens.dashboard.renderMonthlyChart(transactions);
      App.screens.dashboard.renderCategoryChart(transactions);
    }).catch(function (err) {
      console.error('Failed to load transactions:', err);
    });
  },

  renderMonthlyChart: function (transactions) {
    var monthlyData = {};

    transactions.forEach(function (tx) {
      var dateVal = tx.date;
      if (dateVal && dateVal.seconds) {
        dateVal = new Date(dateVal.seconds * 1000);
      }
      var key = App.utils.dateUtils.getMonthKey(dateVal);
      if (!monthlyData[key]) {
        monthlyData[key] = { income: 0, expenses: 0 };
      }
      if (tx.type === 'income') {
        monthlyData[key].income += tx.amount;
      } else {
        monthlyData[key].expenses += tx.amount;
      }
    });

    var keys = Object.keys(monthlyData).sort();
    var labels = keys.map(function (k) {
      var parts = k.split('-');
      var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1);
      return d.toLocaleDateString('en-AU', { month: 'short', year: '2-digit' });
    });

    App.components.chartPanel.createBarChart('monthly-chart', labels, [
      {
        label: 'Income',
        data: keys.map(function (k) { return monthlyData[k].income; }),
        backgroundColor: 'rgba(0, 184, 148, 0.7)',
        borderColor: '#00b894',
        borderWidth: 1
      },
      {
        label: 'Expenses',
        data: keys.map(function (k) { return monthlyData[k].expenses; }),
        backgroundColor: 'rgba(214, 48, 49, 0.7)',
        borderColor: '#d63031',
        borderWidth: 1
      }
    ]);
  },

  renderCategoryChart: function (transactions) {
    var categoryData = {};

    transactions.forEach(function (tx) {
      if (tx.type !== 'expense') return;
      var cat = tx.category || 'Uncategorized';
      categoryData[cat] = (categoryData[cat] || 0) + tx.amount;
    });

    var categories = Object.keys(categoryData).sort(function (a, b) {
      return categoryData[b] - categoryData[a];
    });

    var labels = categories;
    var data = categories.map(function (c) { return categoryData[c]; });

    App.components.chartPanel.createPieChart('category-chart', labels, data);
  }
};

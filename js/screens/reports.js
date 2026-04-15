var App = window.App || {};
App.screens = App.screens || {};

App.screens.reports = {
  transactions: [],
  filters: { business: '', start: '', end: '' },

  render: function () {
    var content = document.getElementById('content');
    if (!content) return;

    var now = new Date();
    var startOfYear = now.getFullYear() + '-01-01';
    var today = now.toISOString().slice(0, 10);

    this.filters.start = startOfYear;
    this.filters.end = today;

    content.innerHTML =
      '<div class="screen">' +
        '<h2>Reports & Export</h2>' +
        '<p class="screen-description">Generate reports and export data for taxes or JobSeeker applications.</p>' +
        '<div class="reports-controls">' +
          '<div class="reports-filters">' +
            '<label class="reports-label">' +
              'From' +
              '<input type="date" class="reports-date" id="report-start" value="' + startOfYear + '">' +
            '</label>' +
            '<label class="reports-label">' +
              'To' +
              '<input type="date" class="reports-date" id="report-end" value="' + today + '">' +
            '</label>' +
            '<label class="reports-label">' +
              'Business' +
              '<select class="tx-filter-select" id="report-business">' +
                '<option value="">All</option>' +
                '<option value="Tech Work">Tech Work</option>' +
                '<option value="Freediving Work">Freediving Work</option>' +
                '<option value="Personal">Personal</option>' +
              '</select>' +
            '</label>' +
          '</div>' +
          '<div class="reports-actions">' +
            '<button class="btn btn--primary" id="export-csv">Export Tax CSV</button>' +
            '<button class="btn btn--secondary" id="export-jobseeker">Export JobSeeker Summary</button>' +
          '</div>' +
        '</div>' +
        '<div id="reports-summary"></div>' +
        '<div id="reports-breakdown"></div>' +
      '</div>';

    this.bindControls();
    this.loadData();
  },

  bindControls: function () {
    var self = this;

    document.getElementById('report-start').addEventListener('change', function (e) {
      self.filters.start = e.target.value;
      self.updateReport();
    });

    document.getElementById('report-end').addEventListener('change', function (e) {
      self.filters.end = e.target.value;
      self.updateReport();
    });

    document.getElementById('report-business').addEventListener('change', function (e) {
      self.filters.business = e.target.value;
      self.updateReport();
    });

    document.getElementById('export-csv').addEventListener('click', function () {
      var filtered = self.getFilteredTransactions();
      App.utils.export.exportCSV(filtered);
    });

    document.getElementById('export-jobseeker').addEventListener('click', function () {
      var filtered = self.getFilteredTransactions();
      App.utils.export.exportJobSeekerSummary(filtered, {
        start: self.filters.start,
        end: self.filters.end
      });
    });
  },

  loadData: function () {
    var self = this;

    App.services.firestore.getTransactions().then(function (transactions) {
      self.transactions = transactions;
      App.setState({ transactions: transactions });
      self.updateReport();
    }).catch(function (err) {
      console.error('Failed to load transactions:', err);
    });
  },

  getFilteredTransactions: function () {
    var filters = this.filters;

    return this.transactions.filter(function (tx) {
      if (filters.business && tx.business !== filters.business) return false;

      var dateVal = tx.date;
      if (dateVal && dateVal.seconds) {
        dateVal = new Date(dateVal.seconds * 1000);
      }
      if (filters.start && dateVal < new Date(filters.start)) return false;
      if (filters.end) {
        var endDate = new Date(filters.end);
        endDate.setHours(23, 59, 59, 999);
        if (dateVal > endDate) return false;
      }

      return true;
    });
  },

  updateReport: function () {
    var filtered = this.getFilteredTransactions();
    this.renderSummary(filtered);
    this.renderBreakdown(filtered);
  },

  renderSummary: function (transactions) {
    var container = document.getElementById('reports-summary');
    if (!container) return;

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

    container.innerHTML =
      '<div class="cards-grid">' +
        App.components.card.render({ title: 'Income', value: fmt(income), subtitle: transactions.filter(function (t) { return t.type === 'income'; }).length + ' transactions', colorClass: 'success' }) +
        App.components.card.render({ title: 'Expenses', value: fmt(expenses), subtitle: transactions.filter(function (t) { return t.type === 'expense'; }).length + ' transactions', colorClass: 'danger' }) +
        App.components.card.render({ title: 'Net', value: fmt(net), colorClass: net >= 0 ? 'success' : 'danger' }) +
        App.components.card.render({ title: 'Transactions', value: transactions.length.toString(), colorClass: 'primary' }) +
      '</div>';
  },

  renderBreakdown: function (transactions) {
    var container = document.getElementById('reports-breakdown');
    if (!container) return;

    if (transactions.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 32px;">No transactions in this date range.</p>';
      return;
    }

    // Monthly breakdown
    var monthly = {};
    transactions.forEach(function (tx) {
      var dateVal = tx.date;
      if (dateVal && dateVal.seconds) {
        dateVal = new Date(dateVal.seconds * 1000);
      }
      var key = App.utils.dateUtils.getMonthKey(dateVal);
      if (!monthly[key]) {
        monthly[key] = { income: 0, expenses: 0 };
      }
      if (tx.type === 'income') {
        monthly[key].income += tx.amount;
      } else {
        monthly[key].expenses += tx.amount;
      }
    });

    var months = Object.keys(monthly).sort();
    var fmt = App.utils.formatters.currency;

    var monthRowsHTML = months.map(function (m) {
      var d = monthly[m];
      var net = d.income - d.expenses;
      var parts = m.split('-');
      var label = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
      return (
        '<tr>' +
          '<td>' + label + '</td>' +
          '<td class="amount--income">' + fmt(d.income) + '</td>' +
          '<td class="amount--expense">' + fmt(d.expenses) + '</td>' +
          '<td class="' + (net >= 0 ? 'amount--income' : 'amount--expense') + '">' + fmt(net) + '</td>' +
        '</tr>'
      );
    }).join('');

    // Category breakdown
    var categories = {};
    transactions.forEach(function (tx) {
      var cat = tx.category || 'Uncategorized';
      if (!categories[cat]) {
        categories[cat] = { income: 0, expenses: 0 };
      }
      if (tx.type === 'income') {
        categories[cat].income += tx.amount;
      } else {
        categories[cat].expenses += tx.amount;
      }
    });

    var catKeys = Object.keys(categories).sort();
    var catRowsHTML = catKeys.map(function (cat) {
      var d = categories[cat];
      return (
        '<tr>' +
          '<td>' + App.components.categoryBadge.render(cat) + '</td>' +
          '<td class="amount--income">' + fmt(d.income) + '</td>' +
          '<td class="amount--expense">' + fmt(d.expenses) + '</td>' +
        '</tr>'
      );
    }).join('');

    container.innerHTML =
      '<div class="reports-tables">' +
        '<div class="report-section">' +
          '<h3>Monthly Breakdown</h3>' +
          '<div class="tx-table-wrapper">' +
            '<table class="tx-table">' +
              '<thead><tr><th>Month</th><th>Income</th><th>Expenses</th><th>Net</th></tr></thead>' +
              '<tbody>' + monthRowsHTML + '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +
        '<div class="report-section">' +
          '<h3>Category Breakdown</h3>' +
          '<div class="tx-table-wrapper">' +
            '<table class="tx-table">' +
              '<thead><tr><th>Category</th><th>Income</th><th>Expenses</th></tr></thead>' +
              '<tbody>' + catRowsHTML + '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +
      '</div>';
  }
};

var App = window.App || {};
App.screens = App.screens || {};

App.screens.transactions = {
  currentPage: 0,
  sortField: 'date',
  sortDir: 'desc',
  filters: {},

  render: function () {
    var content = document.getElementById('content');
    if (!content) return;

    this.currentPage = 0;

    content.innerHTML =
      '<div class="screen">' +
        '<h2>Transactions</h2>' +
        '<div class="tx-filters" id="tx-filters">' +
          '<input type="text" class="tx-search" id="tx-search" placeholder="Search descriptions...">' +
          '<select class="tx-filter-select" id="filter-business">' +
            '<option value="">All businesses</option>' +
            '<option value="Tech Work">Tech Work</option>' +
            '<option value="Freediving Work">Freediving Work</option>' +
            '<option value="Personal">Personal</option>' +
          '</select>' +
          '<select class="tx-filter-select" id="filter-type">' +
            '<option value="">All types</option>' +
            '<option value="income">Income</option>' +
            '<option value="expense">Expense</option>' +
          '</select>' +
          '<select class="tx-filter-select" id="filter-category">' +
            '<option value="">All categories</option>' +
          '</select>' +
        '</div>' +
        '<div id="tx-table-container">' +
          '<p class="tx-loading">Loading transactions...</p>' +
        '</div>' +
      '</div>';

    this.bindFilters();
    this.loadData();
  },

  bindFilters: function () {
    var self = this;

    document.getElementById('tx-search').addEventListener('input', function (e) {
      self.filters.search = e.target.value.toLowerCase();
      self.currentPage = 0;
      self.renderTable();
    });

    document.getElementById('filter-business').addEventListener('change', function (e) {
      self.filters.business = e.target.value;
      self.currentPage = 0;
      self.renderTable();
    });

    document.getElementById('filter-type').addEventListener('change', function (e) {
      self.filters.type = e.target.value;
      self.currentPage = 0;
      self.renderTable();
    });

    document.getElementById('filter-category').addEventListener('change', function (e) {
      self.filters.category = e.target.value;
      self.currentPage = 0;
      self.renderTable();
    });
  },

  loadData: function () {
    var self = this;

    App.services.firestore.getTransactions().then(function (transactions) {
      App.setState({ transactions: transactions });
      self.populateCategoryFilter(transactions);
      self.renderTable();
    }).catch(function (err) {
      console.error('Failed to load transactions:', err);
      document.getElementById('tx-table-container').innerHTML =
        '<p class="import-error">Failed to load transactions: ' + err.message + '</p>';
    });
  },

  populateCategoryFilter: function (transactions) {
    var categories = {};
    transactions.forEach(function (tx) {
      if (tx.category) categories[tx.category] = true;
    });

    var select = document.getElementById('filter-category');
    if (!select) return;

    var sorted = Object.keys(categories).sort();
    sorted.forEach(function (cat) {
      var option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      select.appendChild(option);
    });
  },

  getFilteredTransactions: function () {
    var transactions = App.getState().transactions || [];
    var filters = this.filters;

    return transactions.filter(function (tx) {
      if (filters.search) {
        var desc = (tx.description || '').toLowerCase();
        if (desc.indexOf(filters.search) === -1) return false;
      }
      if (filters.business && tx.business !== filters.business) return false;
      if (filters.type && tx.type !== filters.type) return false;
      if (filters.category && tx.category !== filters.category) return false;
      return true;
    });
  },

  renderTable: function () {
    var self = this;
    var container = document.getElementById('tx-table-container');
    if (!container) return;

    var filtered = this.getFilteredTransactions();

    container.innerHTML = App.components.transactionTable.render(filtered, {
      page: this.currentPage,
      sortField: this.sortField,
      sortDir: this.sortDir
    });

    // Bind sort headers
    var headers = container.querySelectorAll('.tx-th[data-sort]');
    for (var i = 0; i < headers.length; i++) {
      headers[i].addEventListener('click', function (e) {
        var field = e.currentTarget.getAttribute('data-sort');
        if (self.sortField === field) {
          self.sortDir = self.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          self.sortField = field;
          self.sortDir = field === 'date' ? 'desc' : 'asc';
        }
        self.renderTable();
      });
    }

    // Bind pagination
    var pageButtons = container.querySelectorAll('.tx-page-btn');
    for (var j = 0; j < pageButtons.length; j++) {
      pageButtons[j].addEventListener('click', function (e) {
        var page = parseInt(e.currentTarget.getAttribute('data-page'));
        if (!isNaN(page) && page >= 0) {
          self.currentPage = page;
          self.renderTable();
        }
      });
    }
  }
};

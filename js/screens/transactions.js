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
        '<div id="bulk-categorize-section"></div>' +
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
      self.renderBulkCategorize(transactions);
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

    // Clear existing options except the first
    while (select.options.length > 1) select.remove(1);

    var sorted = Object.keys(categories).sort();
    sorted.forEach(function (cat) {
      var option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      select.appendChild(option);
    });
  },

  renderBulkCategorize: function (transactions) {
    var section = document.getElementById('bulk-categorize-section');
    if (!section) return;

    var groups = App.utils.categorizer.groupUncategorized(transactions);
    if (groups.length === 0) {
      section.innerHTML = '';
      return;
    }

    var groupsHTML = groups.slice(0, 10).map(function (group) {
      var amountClass = group.type === 'income' ? 'amount--income' : 'amount--expense';
      return (
        '<div class="bulk-group">' +
          '<div class="bulk-group-info">' +
            '<span class="bulk-group-keyword">' + group.description + '</span>' +
            '<span class="bulk-group-meta">' +
              group.transactions.length + ' transaction' + (group.transactions.length > 1 ? 's' : '') +
              ' &middot; <span class="' + amountClass + '">' + App.utils.formatters.currency(group.totalAmount) + '</span>' +
            '</span>' +
          '</div>' +
          '<button class="btn btn--secondary btn--sm bulk-categorize-btn" data-keyword="' + group.keyword + '" data-description="' + group.description.replace(/"/g, '&quot;') + '" data-count="' + group.transactions.length + '" data-amount="' + group.totalAmount + '">' +
            'Categorize' +
          '</button>' +
        '</div>'
      );
    }).join('');

    section.innerHTML =
      '<div class="bulk-categorize-panel">' +
        '<div class="bulk-header">' +
          '<h3>Uncategorized Transactions</h3>' +
          '<span class="bulk-count">' + groups.length + ' group' + (groups.length > 1 ? 's' : '') + ' to review</span>' +
        '</div>' +
        '<div class="bulk-groups">' + groupsHTML + '</div>' +
      '</div>';

    this.bindBulkCategorize(transactions);
  },

  bindBulkCategorize: function (transactions) {
    var self = this;
    var buttons = document.querySelectorAll('.bulk-categorize-btn');

    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (e) {
        var btn = e.currentTarget;
        var keyword = btn.getAttribute('data-keyword');
        var description = btn.getAttribute('data-description');
        var count = parseInt(btn.getAttribute('data-count'));
        var amount = parseFloat(btn.getAttribute('data-amount'));

        App.components.categorizeModal.show({
          keyword: keyword,
          description: description,
          count: count,
          totalAmount: amount
        }, function (result) {
          self.applyCategorization(keyword, result, transactions);
        });
      });
    }
  },

  applyCategorization: function (keyword, result, allTransactions) {
    var self = this;
    var matching = allTransactions.filter(function (tx) {
      if (tx.category && tx.category !== 'Uncategorized') return false;
      var txKeyword = App.utils.categorizer.extractKeyword(tx.description);
      return txKeyword === keyword;
    });

    var ids = matching.map(function (tx) { return tx.id; }).filter(Boolean);

    if (ids.length === 0) return;

    // Save the learned rule
    if (result.remember) {
      App.utils.categorizer.addLearnedRule(result.keyword, result.category, result.business);
    }

    // Update all matching transactions in Firestore
    App.services.firestore.updateTransactionsBatch(ids, {
      category: result.category,
      business: result.business
    }).then(function () {
      // Reload data to reflect changes
      self.loadData();
    }).catch(function (err) {
      console.error('Failed to update transactions:', err);
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

    // Bind individual categorize buttons on uncategorized rows
    var catBtns = container.querySelectorAll('.tx-categorize-btn');
    for (var k = 0; k < catBtns.length; k++) {
      catBtns[k].addEventListener('click', function (e) {
        e.stopPropagation();
        var txId = e.currentTarget.getAttribute('data-id');
        var desc = e.currentTarget.getAttribute('data-desc');
        var keyword = App.utils.categorizer.extractKeyword(desc);

        App.components.categorizeModal.show({
          keyword: keyword,
          description: desc,
          count: 1,
          totalAmount: 0
        }, function (result) {
          if (result.remember) {
            App.utils.categorizer.addLearnedRule(result.keyword, result.category, result.business);
          }
          App.services.firestore.updateTransaction(txId, {
            category: result.category,
            business: result.business
          }).then(function () {
            self.loadData();
          });
        });
      });
    }
  }
};

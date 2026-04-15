var App = window.App || {};
App.screens = App.screens || {};

App.screens.import = {
  render: function () {
    var content = document.getElementById('content');
    if (!content) return;

    content.innerHTML =
      '<div class="screen">' +
        '<h2>Import Transactions</h2>' +
        '<p class="screen-description">Upload your Revolut CSV statement to import transactions.</p>' +
        '<div id="import-area">' +
          App.components.importDropzone.render() +
        '</div>' +
        '<div id="import-preview" class="import-preview" style="display:none;"></div>' +
        '<div class="import-clear-section">' +
          '<hr>' +
          '<button class="btn btn--danger" id="clear-reimport">Clear all transactions &amp; re-import</button>' +
        '</div>' +
      '</div>';

    App.components.importDropzone.bind(this.handleFile.bind(this));

    document.getElementById('clear-reimport').addEventListener('click', function () {
      if (!confirm('This will delete ALL existing transactions. Are you sure?')) return;

      var btn = document.getElementById('clear-reimport');
      btn.disabled = true;
      btn.textContent = 'Clearing...';

      App.services.firestore.deleteAllTransactions().then(function (count) {
        btn.textContent = 'Cleared ' + count + ' transactions. Upload a CSV above.';
      }).catch(function (err) {
        btn.disabled = false;
        btn.textContent = 'Clear all transactions & re-import';
        alert('Failed to clear: ' + err.message);
      });
    });
  },

  handleFile: function (file) {
    var self = this;
    var previewEl = document.getElementById('import-preview');
    var importArea = document.getElementById('import-area');

    importArea.innerHTML = '<p class="import-loading">Parsing ' + file.name + '...</p>';

    App.utils.csvParser.parse(file).then(function (transactions) {
      App.setState({ pendingImport: transactions });

      importArea.style.display = 'none';
      previewEl.style.display = 'block';
      self.renderPreview(transactions, previewEl);
    }).catch(function (err) {
      importArea.innerHTML =
        App.components.importDropzone.render() +
        '<p class="import-error">Error parsing CSV: ' + err.message + '</p>';
      App.components.importDropzone.bind(self.handleFile.bind(self));
    });
  },

  groupByCurrency: function (transactions) {
    var groups = {};
    transactions.forEach(function (t) {
      var cur = t.currency || 'AUD';
      if (!groups[cur]) groups[cur] = { count: 0, total: 0 };
      groups[cur].count += 1;
      groups[cur].total += t.amount;
    });
    return groups;
  },

  formatCurrencyGroups: function (groups) {
    return Object.keys(groups).map(function (cur) {
      var g = groups[cur];
      return g.count + ' (' + App.utils.formatters.currency(g.total, cur) + ')';
    }).join(', ');
  },

  renderPreview: function (transactions, container) {
    var self = this;
    var income = transactions.filter(function (t) { return t.type === 'income'; });
    var expenses = transactions.filter(function (t) { return t.type === 'expense'; });

    var incomeGroups = this.groupByCurrency(income);
    var expenseGroups = this.groupByCurrency(expenses);

    var rowsHTML = transactions.slice(0, 50).map(function (tx) {
      var amountClass = tx.type === 'income' ? 'amount--income' : 'amount--expense';
      var sign = tx.type === 'income' ? '+' : '-';
      return (
        '<tr>' +
          '<td>' + App.utils.dateUtils.formatDate(tx.date) + '</td>' +
          '<td>' + App.utils.formatters.truncate(tx.description, 50) + '</td>' +
          '<td class="' + amountClass + '">' + sign + App.utils.formatters.currency(tx.amount, tx.currency) + '</td>' +
          '<td><span class="category-badge">' + tx.category + '</span></td>' +
          '<td>' + tx.business + '</td>' +
        '</tr>'
      );
    }).join('');

    container.innerHTML =
      '<div class="import-summary">' +
        '<h3>Preview — ' + transactions.length + ' transactions</h3>' +
        '<div class="import-stats">' +
          '<span class="amount--income">' + self.formatCurrencyGroups(incomeGroups) + ' income</span>' +
          '<span class="amount--expense">' + self.formatCurrencyGroups(expenseGroups) + ' expenses</span>' +
        '</div>' +
      '</div>' +
      '<div class="import-table-wrapper">' +
        '<table class="import-table">' +
          '<thead>' +
            '<tr><th>Date</th><th>Description</th><th>Amount</th><th>Category</th><th>Business</th></tr>' +
          '</thead>' +
          '<tbody>' + rowsHTML + '</tbody>' +
        '</table>' +
        (transactions.length > 50 ? '<p class="import-truncated">Showing first 50 of ' + transactions.length + ' transactions</p>' : '') +
      '</div>' +
      '<div class="import-actions">' +
        '<button class="btn btn--primary" id="import-confirm">Import ' + transactions.length + ' transactions</button>' +
        '<button class="btn btn--secondary" id="import-cancel">Cancel</button>' +
      '</div>';

    document.getElementById('import-confirm').addEventListener('click', function () {
      self.confirmImport(transactions);
    });

    document.getElementById('import-cancel').addEventListener('click', function () {
      self.render();
    });
  },

  confirmImport: function (transactions) {
    var previewEl = document.getElementById('import-preview');
    previewEl.innerHTML = '<p class="import-loading">Checking for duplicates...</p>';

    var firestoreTransactions = transactions.map(function (tx) {
      return Object.assign({}, tx, {
        date: App.utils.dateUtils.toFirestoreTimestamp(tx.date)
      });
    });

    App.services.firestore.getExistingKeys().then(function (existingKeys) {
      var unique = firestoreTransactions.filter(function (tx) {
        var ts = tx.date && tx.date.seconds ? tx.date.seconds : '';
        var key = ts + '|' + tx.description + '|' + tx.amount;
        return !existingKeys.has(key);
      });

      var skipped = firestoreTransactions.length - unique.length;

      if (unique.length === 0) {
        previewEl.innerHTML =
          '<div class="import-success">' +
            '<p>All ' + firestoreTransactions.length + ' transactions already exist. Nothing to import.</p>' +
            '<button class="btn btn--primary" id="go-dashboard">Go to Dashboard</button>' +
            '<button class="btn btn--secondary" id="import-more">Import different file</button>' +
          '</div>';

        document.getElementById('go-dashboard').addEventListener('click', function () {
          App.showScreen('dashboard');
        });
        document.getElementById('import-more').addEventListener('click', function () {
          App.showScreen('import');
        });
        return;
      }

      previewEl.innerHTML = '<p class="import-loading">Importing ' + unique.length + ' transactions...</p>';

      App.services.firestore.addTransactions(unique).then(function () {
        var msg = 'Successfully imported ' + unique.length + ' transactions.';
        if (skipped > 0) {
          msg += ' Skipped ' + skipped + ' duplicates.';
        }

        previewEl.innerHTML =
          '<div class="import-success">' +
            '<p>' + msg + '</p>' +
            '<button class="btn btn--primary" id="go-dashboard">Go to Dashboard</button>' +
            '<button class="btn btn--secondary" id="import-more">Import more</button>' +
          '</div>';

        document.getElementById('go-dashboard').addEventListener('click', function () {
          App.showScreen('dashboard');
        });
        document.getElementById('import-more').addEventListener('click', function () {
          App.showScreen('import');
        });
      }).catch(function (err) {
        previewEl.innerHTML =
          '<p class="import-error">Import failed: ' + err.message + '</p>' +
          '<button class="btn btn--secondary" id="import-retry">Try again</button>';

        document.getElementById('import-retry').addEventListener('click', function () {
          App.showScreen('import');
        });
      });
    }).catch(function (err) {
      previewEl.innerHTML =
        '<p class="import-error">Failed to check for duplicates: ' + err.message + '</p>' +
        '<button class="btn btn--secondary" id="import-retry">Try again</button>';

      document.getElementById('import-retry').addEventListener('click', function () {
        App.showScreen('import');
      });
    });
  }
};

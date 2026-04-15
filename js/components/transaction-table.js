var App = window.App || {};
App.components = App.components || {};

(function () {
  var PAGE_SIZE = 25;

  App.components.transactionTable = {
    render: function (transactions, options) {
      var opts = options || {};
      var page = opts.page || 0;
      var sortField = opts.sortField || 'date';
      var sortDir = opts.sortDir || 'desc';

      var sorted = transactions.slice().sort(function (a, b) {
        var aVal = a[sortField];
        var bVal = b[sortField];

        if (sortField === 'date') {
          aVal = aVal instanceof Date ? aVal.getTime() : new Date(aVal.seconds ? aVal.seconds * 1000 : aVal).getTime();
          bVal = bVal instanceof Date ? bVal.getTime() : new Date(bVal.seconds ? bVal.seconds * 1000 : bVal).getTime();
        }
        if (sortField === 'amount') {
          aVal = Number(aVal);
          bVal = Number(bVal);
        }

        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });

      var start = page * PAGE_SIZE;
      var pageItems = sorted.slice(start, start + PAGE_SIZE);
      var totalPages = Math.ceil(sorted.length / PAGE_SIZE);

      var headers = ['Date', 'Description', 'Amount', 'Category', 'Business', 'Type'];
      var fields = ['date', 'description', 'amount', 'category', 'business', 'type'];

      var thHTML = headers.map(function (h, i) {
        var field = fields[i];
        var arrow = '';
        if (field === sortField) {
          arrow = sortDir === 'asc' ? ' &#9650;' : ' &#9660;';
        }
        return '<th class="tx-th" data-sort="' + field + '">' + h + arrow + '</th>';
      }).join('');

      var rowsHTML = pageItems.map(function (tx) {
        var dateVal = tx.date;
        if (dateVal && dateVal.seconds) {
          dateVal = new Date(dateVal.seconds * 1000);
        }
        var amountClass = tx.type === 'income' ? 'amount--income' : 'amount--expense';
        var sign = tx.type === 'income' ? '+' : '-';

        var isUncategorized = !tx.category || tx.category === 'Uncategorized';
        var categoryCell = isUncategorized
          ? '<button class="btn btn--sm tx-categorize-btn" data-id="' + (tx.id || '') + '" data-desc="' + (tx.description || '').replace(/"/g, '&quot;') + '">Categorize</button>'
          : App.components.categoryBadge.render(tx.category);

        return (
          '<tr class="tx-row' + (isUncategorized ? ' tx-row--uncategorized' : '') + '" data-id="' + (tx.id || '') + '">' +
            '<td>' + App.utils.dateUtils.formatDate(dateVal) + '</td>' +
            '<td class="tx-desc">' + App.utils.formatters.truncate(tx.description, 45) + '</td>' +
            '<td class="' + amountClass + '">' + sign + App.utils.formatters.currency(tx.amount, tx.currency) + '</td>' +
            '<td>' + categoryCell + '</td>' +
            '<td>' + (tx.business || '') + '</td>' +
            '<td><span class="type-badge type-badge--' + tx.type + '">' + tx.type + '</span></td>' +
          '</tr>'
        );
      }).join('');

      if (pageItems.length === 0) {
        rowsHTML = '<tr><td colspan="6" class="tx-empty">No transactions found</td></tr>';
      }

      var paginationHTML = '';
      if (totalPages > 1) {
        paginationHTML =
          '<div class="tx-pagination">' +
            '<button class="btn btn--secondary tx-page-btn" data-page="' + (page - 1) + '"' + (page === 0 ? ' disabled' : '') + '>&laquo; Previous</button>' +
            '<span class="tx-page-info">Page ' + (page + 1) + ' of ' + totalPages + ' (' + sorted.length + ' total)</span>' +
            '<button class="btn btn--secondary tx-page-btn" data-page="' + (page + 1) + '"' + (page >= totalPages - 1 ? ' disabled' : '') + '>Next &raquo;</button>' +
          '</div>';
      }

      return (
        '<div class="tx-table-wrapper">' +
          '<table class="tx-table">' +
            '<thead><tr>' + thHTML + '</tr></thead>' +
            '<tbody>' + rowsHTML + '</tbody>' +
          '</table>' +
        '</div>' +
        paginationHTML
      );
    }
  };
})();

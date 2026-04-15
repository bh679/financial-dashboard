var App = window.App || {};
App.utils = App.utils || {};

App.utils.export = {
  exportCSV: function (transactions, filename) {
    var headers = ['Date', 'Description', 'Amount', 'Type', 'Currency', 'Category', 'Business'];
    var rows = transactions.map(function (tx) {
      var dateVal = tx.date;
      if (dateVal && dateVal.seconds) {
        dateVal = new Date(dateVal.seconds * 1000);
      }
      return [
        App.utils.dateUtils.formatDate(dateVal),
        '"' + (tx.description || '').replace(/"/g, '""') + '"',
        tx.type === 'expense' ? '-' + tx.amount.toFixed(2) : tx.amount.toFixed(2),
        tx.type,
        tx.currency || 'AUD',
        tx.category || 'Uncategorized',
        tx.business || ''
      ].join(',');
    });

    var csv = headers.join(',') + '\n' + rows.join('\n');
    var fname = filename || 'financial-export-' + new Date().toISOString().slice(0, 10) + '.csv';

    App.utils.export.downloadFile(csv, fname, 'text/csv');
  },

  exportJobSeekerSummary: function (transactions, dateRange) {
    var income = 0;
    var expenses = 0;
    var incomeCount = 0;
    var expenseCount = 0;

    var byBusiness = {};

    transactions.forEach(function (tx) {
      if (tx.type === 'income') {
        income += tx.amount;
        incomeCount++;
      } else {
        expenses += tx.amount;
        expenseCount++;
      }

      var biz = tx.business || 'Personal';
      if (!byBusiness[biz]) {
        byBusiness[biz] = { income: 0, expenses: 0 };
      }
      if (tx.type === 'income') {
        byBusiness[biz].income += tx.amount;
      } else {
        byBusiness[biz].expenses += tx.amount;
      }
    });

    var net = income - expenses;
    var fmt = App.utils.formatters.currency;

    var lines = [
      '====================================',
      'FINANCIAL SUMMARY — JOBSEEKER REPORT',
      '====================================',
      '',
      'Period: ' + (dateRange.start || 'All time') + ' to ' + (dateRange.end || 'Present'),
      'Generated: ' + new Date().toLocaleDateString('en-AU'),
      '',
      '--- TOTALS ---',
      'Total Income:   ' + fmt(income) + ' (' + incomeCount + ' transactions)',
      'Total Expenses: ' + fmt(expenses) + ' (' + expenseCount + ' transactions)',
      'Net:            ' + fmt(net),
      ''
    ];

    var businesses = Object.keys(byBusiness).sort();
    if (businesses.length > 0) {
      lines.push('--- BY BUSINESS ---');
      businesses.forEach(function (biz) {
        var d = byBusiness[biz];
        lines.push('');
        lines.push(biz + ':');
        lines.push('  Income:   ' + fmt(d.income));
        lines.push('  Expenses: ' + fmt(d.expenses));
        lines.push('  Net:      ' + fmt(d.income - d.expenses));
      });
      lines.push('');
    }

    lines.push('--- BY CATEGORY ---');
    var byCategory = {};
    transactions.forEach(function (tx) {
      var cat = tx.category || 'Uncategorized';
      if (!byCategory[cat]) byCategory[cat] = 0;
      byCategory[cat] += tx.type === 'expense' ? -tx.amount : tx.amount;
    });

    Object.keys(byCategory).sort().forEach(function (cat) {
      lines.push('  ' + cat + ': ' + fmt(byCategory[cat]));
    });

    lines.push('');
    lines.push('====================================');

    var text = lines.join('\n');
    var fname = 'jobseeker-summary-' + new Date().toISOString().slice(0, 10) + '.txt';

    App.utils.export.downloadFile(text, fname, 'text/plain');
  },

  downloadFile: function (content, filename, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

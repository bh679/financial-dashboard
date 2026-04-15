var App = window.App || {};
App.utils = App.utils || {};

(function () {
  // Known Revolut CSV column name mappings
  var COLUMN_MAP = {
    'date started': 'date',
    'started date': 'date',
    'date completed': 'dateCompleted',
    'completed date': 'dateCompleted',
    'date': 'date',
    'description': 'description',
    'reference': 'description',
    'amount': 'amount',
    'fee': 'fee',
    'currency': 'currency',
    'type': 'txType',
    'state': 'status',
    'status': 'status',
    'balance': 'balance',
    'product': 'product',
    'category': 'originalCategory'
  };

  function normalizeColumnName(name) {
    return (name || '').trim().toLowerCase();
  }

  function parseAmount(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    var cleaned = String(value).replace(/[^0-9.\-]/g, '');
    return parseFloat(cleaned) || 0;
  }

  App.utils.csvParser = {
    parse: function (fileOrText) {
      return new Promise(function (resolve, reject) {
        var config = {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
          complete: function (results) {
            if (results.errors.length > 0) {
              console.warn('CSV parse warnings:', results.errors);
            }
            try {
              var transactions = App.utils.csvParser.normalize(results.data);
              resolve(transactions);
            } catch (e) {
              reject(e);
            }
          },
          error: function (err) {
            reject(err);
          }
        };

        if (typeof fileOrText === 'string') {
          Papa.parse(fileOrText, config);
        } else {
          Papa.parse(fileOrText, config);
        }
      });
    },

    normalize: function (rows) {
      if (!rows || rows.length === 0) return [];

      // Build column mapping from first row's keys
      var sampleKeys = Object.keys(rows[0]);
      var mapping = {};
      sampleKeys.forEach(function (key) {
        var normalized = normalizeColumnName(key);
        if (COLUMN_MAP[normalized]) {
          mapping[key] = COLUMN_MAP[normalized];
        }
      });

      return rows.map(function (row) {
        var mapped = {};
        Object.keys(mapping).forEach(function (originalKey) {
          mapped[mapping[originalKey]] = row[originalKey];
        });

        var amount = parseAmount(mapped.amount);
        var cat = App.utils.categorizer.categorize(mapped.description);

        return {
          date: App.utils.dateUtils.parseDate(mapped.date),
          description: (mapped.description || '').trim(),
          amount: Math.abs(amount),
          currency: (mapped.currency || 'AUD').trim().toUpperCase(),
          type: amount >= 0 ? 'income' : 'expense',
          category: cat.category,
          business: cat.business,
          status: (mapped.status || 'completed').trim().toLowerCase(),
          source: 'revolut-csv',
          rawRow: Object.assign({}, row)
        };
      }).filter(function (tx) {
        return tx.date !== null && tx.amount !== 0;
      });
    }
  };
})();

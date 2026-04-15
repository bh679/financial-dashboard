var App = window.App || {};
App.services = App.services || {};

(function () {
  var STORAGE_KEY_PREFIX = 'financial-dashboard-transactions-';

  function getStorageKey() {
    var user = App.getState().user;
    if (!user) throw new Error('Not authenticated');
    return STORAGE_KEY_PREFIX + user.uid;
  }

  function loadAll() {
    try {
      var data = localStorage.getItem(getStorageKey());
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Failed to load transactions from localStorage:', e);
      return [];
    }
  }

  function saveAll(transactions) {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions to localStorage:', e);
      throw new Error('Storage full — unable to save transactions');
    }
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  // Expose as App.services.firestore so all existing code works without changes
  App.services.firestore = {
    addTransactions: function (transactions) {
      var existing = loadAll();
      var now = new Date().toISOString();

      var newTxs = transactions.map(function (tx) {
        return Object.assign({}, tx, {
          id: generateId(),
          importedAt: now
        });
      });

      saveAll(existing.concat(newTxs));
      return Promise.resolve();
    },

    getTransactions: function (filters) {
      var all = loadAll();

      if (filters) {
        all = all.filter(function (tx) {
          if (filters.business && tx.business !== filters.business) return false;
          if (filters.category && tx.category !== filters.category) return false;
          if (filters.type && tx.type !== filters.type) return false;
          return true;
        });
      }

      // Sort by date descending
      all.sort(function (a, b) {
        var aTime = a.date && a.date.seconds ? a.date.seconds : (a.date ? new Date(a.date).getTime() / 1000 : 0);
        var bTime = b.date && b.date.seconds ? b.date.seconds : (b.date ? new Date(b.date).getTime() / 1000 : 0);
        return bTime - aTime;
      });

      return Promise.resolve(all);
    },

    updateTransaction: function (id, updates) {
      var all = loadAll();
      var updated = all.map(function (tx) {
        if (tx.id === id) {
          return Object.assign({}, tx, updates);
        }
        return tx;
      });
      saveAll(updated);
      return Promise.resolve();
    },

    updateTransactionsBatch: function (ids, updates) {
      var idSet = {};
      ids.forEach(function (id) { idSet[id] = true; });

      var all = loadAll();
      var updated = all.map(function (tx) {
        if (idSet[tx.id]) {
          return Object.assign({}, tx, updates);
        }
        return tx;
      });
      saveAll(updated);
      return Promise.resolve();
    },

    deleteTransaction: function (id) {
      var all = loadAll();
      var filtered = all.filter(function (tx) { return tx.id !== id; });
      saveAll(filtered);
      return Promise.resolve();
    },

    deleteAllTransactions: function () {
      var all = loadAll();
      var count = all.length;
      saveAll([]);
      return Promise.resolve(count);
    },

    getExistingKeys: function () {
      var all = loadAll();
      var keys = new Set();
      all.forEach(function (tx) {
        var ts = tx.date && tx.date.seconds ? tx.date.seconds : '';
        keys.add(ts + '|' + tx.description + '|' + tx.amount);
      });
      return Promise.resolve(keys);
    }
  };
})();

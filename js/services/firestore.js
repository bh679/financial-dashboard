var App = window.App || {};
App.services = App.services || {};

(function () {
  var cache = {
    transactions: null,
    uid: null
  };

  function getUserCollection() {
    var user = App.getState().user;
    if (!user) throw new Error('Not authenticated');
    return firebase.firestore().collection('users').doc(user.uid).collection('transactions');
  }

  function getCurrentUid() {
    var user = App.getState().user;
    return user ? user.uid : null;
  }

  function invalidateCache() {
    cache.transactions = null;
  }

  function fetchAll() {
    var uid = getCurrentUid();

    // Return cached if same user and cache exists
    if (cache.transactions && cache.uid === uid) {
      return Promise.resolve(cache.transactions);
    }

    // Simple query — no orderBy or where (avoids composite index requirements)
    return getUserCollection().get().then(function (snapshot) {
      var results = [];
      snapshot.forEach(function (doc) {
        results.push(Object.assign({ id: doc.id }, doc.data()));
      });

      // Sort client-side by date descending
      results.sort(function (a, b) {
        var aTime = a.date && a.date.seconds ? a.date.seconds : 0;
        var bTime = b.date && b.date.seconds ? b.date.seconds : 0;
        return bTime - aTime;
      });

      cache.transactions = results;
      cache.uid = uid;
      return results;
    });
  }

  App.services.firestore = {
    addTransactions: function (transactions) {
      var col = getUserCollection();
      var promises = [];

      // Firestore batches limited to 500 operations
      for (var i = 0; i < transactions.length; i += 500) {
        var batch = firebase.firestore().batch();
        transactions.slice(i, i + 500).forEach(function (tx) {
          var ref = col.doc();
          batch.set(ref, Object.assign({}, tx, {
            importedAt: firebase.firestore.FieldValue.serverTimestamp()
          }));
        });
        promises.push(batch.commit());
      }

      return Promise.all(promises).then(function () {
        invalidateCache();
      });
    },

    getTransactions: function (filters) {
      return fetchAll().then(function (all) {
        if (!filters) return all;

        return all.filter(function (tx) {
          if (filters.business && tx.business !== filters.business) return false;
          if (filters.category && tx.category !== filters.category) return false;
          if (filters.type && tx.type !== filters.type) return false;
          return true;
        });
      });
    },

    updateTransaction: function (id, updates) {
      return getUserCollection().doc(id).update(updates).then(function () {
        invalidateCache();
      });
    },

    updateTransactionsBatch: function (ids, updates) {
      var col = getUserCollection();
      var promises = [];

      for (var i = 0; i < ids.length; i += 500) {
        var batch = firebase.firestore().batch();
        ids.slice(i, i + 500).forEach(function (id) {
          batch.update(col.doc(id), updates);
        });
        promises.push(batch.commit());
      }

      return Promise.all(promises).then(function () {
        invalidateCache();
      });
    },

    deleteTransaction: function (id) {
      return getUserCollection().doc(id).delete().then(function () {
        invalidateCache();
      });
    },

    deleteAllTransactions: function () {
      return fetchAll().then(function (all) {
        var col = getUserCollection();
        var count = all.length;
        var promises = [];

        for (var i = 0; i < all.length; i += 500) {
          var batch = firebase.firestore().batch();
          all.slice(i, i + 500).forEach(function (tx) {
            batch.delete(col.doc(tx.id));
          });
          promises.push(batch.commit());
        }

        return Promise.all(promises).then(function () {
          invalidateCache();
          return count;
        });
      });
    },

    getExistingKeys: function () {
      return fetchAll().then(function (all) {
        var keys = new Set();
        all.forEach(function (tx) {
          var ts = tx.date && tx.date.seconds ? tx.date.seconds : '';
          keys.add(ts + '|' + tx.description + '|' + tx.amount);
        });
        return keys;
      });
    },

    invalidateCache: invalidateCache
  };
})();

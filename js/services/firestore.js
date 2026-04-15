var App = window.App || {};
App.services = App.services || {};

(function () {
  function getUserCollection() {
    var user = App.getState().user;
    if (!user) throw new Error('Not authenticated');
    return firebase.firestore().collection('users').doc(user.uid).collection('transactions');
  }

  App.services.firestore = {
    addTransactions: function (transactions) {
      var batch = firebase.firestore().batch();
      var col = getUserCollection();

      transactions.forEach(function (tx) {
        var ref = col.doc();
        batch.set(ref, Object.assign({}, tx, {
          importedAt: firebase.firestore.FieldValue.serverTimestamp()
        }));
      });

      return batch.commit();
    },

    getTransactions: function (filters) {
      var query = getUserCollection();

      if (filters) {
        if (filters.business) {
          query = query.where('business', '==', filters.business);
        }
        if (filters.category) {
          query = query.where('category', '==', filters.category);
        }
        if (filters.type) {
          query = query.where('type', '==', filters.type);
        }
      }

      query = query.orderBy('date', 'desc');

      return query.get().then(function (snapshot) {
        var results = [];
        snapshot.forEach(function (doc) {
          results.push(Object.assign({ id: doc.id }, doc.data()));
        });
        return results;
      });
    },

    updateTransaction: function (id, updates) {
      return getUserCollection().doc(id).update(updates);
    },

    updateTransactionsBatch: function (ids, updates) {
      var batch = firebase.firestore().batch();
      var col = getUserCollection();

      ids.forEach(function (id) {
        batch.update(col.doc(id), updates);
      });

      return batch.commit();
    },

    deleteTransaction: function (id) {
      return getUserCollection().doc(id).delete();
    },

    deleteAllTransactions: function () {
      var col = getUserCollection();
      return col.get().then(function (snapshot) {
        var docs = [];
        snapshot.forEach(function (doc) { docs.push(doc.ref); });

        // Firestore batches limited to 500 operations
        var batches = [];
        for (var i = 0; i < docs.length; i += 500) {
          var batch = firebase.firestore().batch();
          docs.slice(i, i + 500).forEach(function (ref) {
            batch.delete(ref);
          });
          batches.push(batch.commit());
        }

        return Promise.all(batches).then(function () {
          return docs.length;
        });
      });
    },

    getExistingKeys: function () {
      return getUserCollection().get().then(function (snapshot) {
        var keys = new Set();
        snapshot.forEach(function (doc) {
          var data = doc.data();
          var ts = data.date && data.date.seconds ? data.date.seconds : '';
          keys.add(ts + '|' + data.description + '|' + data.amount);
        });
        return keys;
      });
    }
  };
})();

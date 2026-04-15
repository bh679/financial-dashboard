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

    deleteTransaction: function (id) {
      return getUserCollection().doc(id).delete();
    }
  };
})();

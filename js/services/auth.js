var App = window.App || {};
App.services = App.services || {};

(function () {
  var provider = new firebase.auth.GoogleAuthProvider();

  App.services.auth = {
    signInWithGoogle: function () {
      return firebase.auth().signInWithPopup(provider);
    },

    signOut: function () {
      return firebase.auth().signOut();
    },

    getCurrentUser: function () {
      return firebase.auth().currentUser;
    },

    onAuthStateChanged: function (callback) {
      return firebase.auth().onAuthStateChanged(callback);
    }
  };
})();

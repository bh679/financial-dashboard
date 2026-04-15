var App = window.App || {};

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    firebase.initializeApp(App.firebaseConfig);

    App.services.auth.onAuthStateChanged(function (user) {
      if (user) {
        App.setState({
          user: {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL
          }
        });
        // Load learned categorization rules from localStorage
        App.utils.categorizer.loadLearnedRules();
        var target = App.getScreenFromHash();
        App.showScreen(target);
      } else {
        App.setState({ user: null, transactions: [] });
        App.showScreen('login');
      }
    });
  });
})();

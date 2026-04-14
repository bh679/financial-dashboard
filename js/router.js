var App = window.App || {};

(function () {
  var SCREENS = {
    login: function () { App.screens.login.render(); },
    dashboard: function () { App.screens.dashboard.render(); },
    import: function () { App.screens.import.render(); },
    transactions: function () { App.screens.transactions.render(); },
    reports: function () { App.screens.reports.render(); }
  };

  var AUTH_REQUIRED = ['dashboard', 'import', 'transactions', 'reports'];

  App.showScreen = function (name) {
    var user = App.getState().user;

    if (AUTH_REQUIRED.indexOf(name) !== -1 && !user) {
      name = 'login';
    }

    if (name === 'login' && user) {
      name = 'dashboard';
    }

    if (!SCREENS[name]) {
      name = 'dashboard';
    }

    App.setState({ currentScreen: name });
    window.location.hash = name;
    document.title = 'Financial Dashboard — ' + name.charAt(0).toUpperCase() + name.slice(1);

    SCREENS[name]();
  };

  App.getScreenFromHash = function () {
    var hash = window.location.hash.replace('#', '');
    return hash && SCREENS[hash] ? hash : 'dashboard';
  };

  window.addEventListener('hashchange', function () {
    var screen = App.getScreenFromHash();
    if (screen !== App.getState().currentScreen) {
      App.showScreen(screen);
    }
  });
})();

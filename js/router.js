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

  function renderAppShell() {
    var app = document.getElementById('app');
    app.innerHTML =
      App.components.header.render() +
      '<div class="app-layout">' +
        App.components.sidebar.render() +
        '<main class="app-main" id="content"></main>' +
      '</div>';

    App.components.header.bind();
    App.components.sidebar.bind();
  }

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

    var prevScreen = App.getState().currentScreen;
    App.setState({ currentScreen: name });
    window.location.hash = name;
    document.title = 'Financial Dashboard \u2014 ' + name.charAt(0).toUpperCase() + name.slice(1);

    // Render app shell if switching between login and authenticated screens
    var wasAuth = AUTH_REQUIRED.indexOf(prevScreen) !== -1;
    var isAuth = AUTH_REQUIRED.indexOf(name) !== -1;

    if (name === 'login') {
      SCREENS[name]();
    } else {
      if (!wasAuth || !document.getElementById('content')) {
        renderAppShell();
      } else {
        // Update sidebar active state without full re-render
        var sidebarEl = document.getElementById('sidebar');
        if (sidebarEl) {
          var links = sidebarEl.querySelectorAll('.sidebar-link');
          for (var i = 0; i < links.length; i++) {
            var href = links[i].getAttribute('href');
            if (href === '#' + name) {
              links[i].classList.add('sidebar-link--active');
            } else {
              links[i].classList.remove('sidebar-link--active');
            }
          }
        }
      }
      SCREENS[name]();
    }
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

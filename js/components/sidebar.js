var App = window.App || {};
App.components = App.components || {};

App.components.sidebar = {
  render: function () {
    var current = App.getState().currentScreen;
    var items = [
      { name: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' },
      { name: 'import', label: 'Import CSV', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
      { name: 'transactions', label: 'Transactions', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      { name: 'reports', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
    ];

    var linksHTML = items.map(function (item) {
      var active = current === item.name ? ' sidebar-link--active' : '';
      return (
        '<a class="sidebar-link' + active + '" href="#' + item.name + '">' +
          '<svg class="sidebar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="' + item.icon + '"/>' +
          '</svg>' +
          '<span>' + item.label + '</span>' +
        '</a>'
      );
    }).join('');

    return (
      '<nav class="sidebar" id="sidebar">' +
        '<div class="sidebar-links">' +
          linksHTML +
        '</div>' +
      '</nav>'
    );
  },

  bind: function () {
    var sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    sidebar.addEventListener('click', function (e) {
      var link = e.target.closest('.sidebar-link');
      if (link && window.innerWidth <= 768) {
        sidebar.classList.remove('sidebar--open');
      }
    });
  }
};

var App = window.App || {};
App.components = App.components || {};

App.components.header = {
  render: function () {
    var user = App.getState().user;
    var photoHTML = user && user.photoURL
      ? '<img class="header-avatar" src="' + user.photoURL + '" alt="avatar" referrerpolicy="no-referrer">'
      : '<div class="header-avatar header-avatar--placeholder">' + (user ? user.displayName.charAt(0) : '?') + '</div>';

    return (
      '<header class="header">' +
        '<div class="header-left">' +
          '<button class="header-menu-btn" id="sidebar-toggle" aria-label="Toggle menu">' +
            '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<line x1="3" y1="6" x2="21" y2="6"/>' +
              '<line x1="3" y1="12" x2="21" y2="12"/>' +
              '<line x1="3" y1="18" x2="21" y2="18"/>' +
            '</svg>' +
          '</button>' +
          '<h1 class="header-title">Financial Dashboard</h1>' +
        '</div>' +
        '<div class="header-right">' +
          (user
            ? '<span class="header-name">' + user.displayName + '</span>' +
              photoHTML +
              '<button class="header-sign-out" id="sign-out-btn">Sign out</button>'
            : '') +
        '</div>' +
      '</header>'
    );
  },

  bind: function () {
    var signOutBtn = document.getElementById('sign-out-btn');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', function () {
        App.services.auth.signOut();
      });
    }

    var toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        var sidebar = document.getElementById('sidebar');
        if (sidebar) {
          sidebar.classList.toggle('sidebar--open');
        }
      });
    }
  }
};

var App = window.App || {};

(function () {
  var state = Object.freeze({
    user: null,
    transactions: [],
    filters: {},
    loading: false,
    currentScreen: 'login'
  });

  App.getState = function () {
    return state;
  };

  App.setState = function (updates) {
    state = Object.freeze(Object.assign({}, state, updates));
    return state;
  };
})();

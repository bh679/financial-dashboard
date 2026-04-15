var App = window.App || {};
App.utils = App.utils || {};

App.utils.formatters = {
  currency: function (amount, currencyCode) {
    var code = currencyCode || 'AUD';
    try {
      return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (e) {
      return '$' + Number(amount).toFixed(2);
    }
  },

  number: function (value) {
    return new Intl.NumberFormat('en-AU').format(value);
  },

  percentage: function (value) {
    return Number(value).toFixed(1) + '%';
  },

  truncate: function (str, maxLen) {
    var max = maxLen || 40;
    if (!str || str.length <= max) return str || '';
    return str.substring(0, max) + '...';
  }
};

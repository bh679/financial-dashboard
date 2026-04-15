var App = window.App || {};
App.utils = App.utils || {};

App.utils.dateUtils = {
  parseDate: function (dateStr) {
    if (!dateStr) return null;
    var d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  },

  formatDate: function (date) {
    if (!date) return '';
    var d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  formatMonthYear: function (date) {
    if (!date) return '';
    var d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long'
    });
  },

  getMonthKey: function (date) {
    var d = date instanceof Date ? date : new Date(date);
    var month = String(d.getMonth() + 1).padStart(2, '0');
    return d.getFullYear() + '-' + month;
  },

  getYearKey: function (date) {
    var d = date instanceof Date ? date : new Date(date);
    return String(d.getFullYear());
  },

  isInRange: function (date, startDate, endDate) {
    var d = date instanceof Date ? date : new Date(date);
    var start = startDate ? new Date(startDate) : null;
    var end = endDate ? new Date(endDate) : null;

    if (start && d < start) return false;
    if (end && d > end) return false;
    return true;
  },

  toFirestoreTimestamp: function (date) {
    var d = date instanceof Date ? date : new Date(date);
    return firebase.firestore.Timestamp.fromDate(d);
  }
};

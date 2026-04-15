var App = window.App || {};
App.components = App.components || {};

App.components.card = {
  render: function (options) {
    var title = options.title || '';
    var value = options.value || '';
    var subtitle = options.subtitle || '';
    var colorClass = options.colorClass || '';

    return (
      '<div class="card' + (colorClass ? ' card--' + colorClass : '') + '">' +
        '<div class="card-title">' + title + '</div>' +
        '<div class="card-value">' + value + '</div>' +
        (subtitle ? '<div class="card-subtitle">' + subtitle + '</div>' : '') +
      '</div>'
    );
  }
};

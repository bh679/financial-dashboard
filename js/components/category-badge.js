var App = window.App || {};
App.components = App.components || {};

(function () {
  var CATEGORY_COLORS = {
    'Claude API': { bg: '#dfe6fd', text: '#4834d4' },
    'AWS': { bg: '#fff3cd', text: '#856404' },
    'Domains': { bg: '#d4edda', text: '#155724' },
    'Hosting': { bg: '#cce5ff', text: '#004085' },
    'AI Services': { bg: '#e2d6f3', text: '#6c5ce7' },
    'Certifications': { bg: '#d1ecf1', text: '#0c5460' },
    'Freediving': { bg: '#cff4fc', text: '#055160' },
    'Equipment': { bg: '#fde2d4', text: '#9c4221' },
    'Uncategorized': { bg: '#f1f2f6', text: '#636e72' }
  };

  App.components.categoryBadge = {
    render: function (category) {
      var colors = CATEGORY_COLORS[category] || CATEGORY_COLORS['Uncategorized'];
      return '<span class="category-badge" style="background:' + colors.bg + ';color:' + colors.text + ';">' + category + '</span>';
    }
  };
})();

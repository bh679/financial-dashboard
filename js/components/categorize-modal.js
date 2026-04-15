var App = window.App || {};
App.components = App.components || {};

App.components.categorizeModal = {
  render: function (options) {
    var keyword = options.keyword || '';
    var description = options.description || '';
    var count = options.count || 1;
    var totalAmount = options.totalAmount || 0;

    var categoriesHTML = [
      'Claude API', 'AWS', 'Domains', 'Hosting', 'AI Services',
      'Certifications', 'Freediving', 'Equipment',
      'Salary', 'Freelance', 'Sales', 'Refund',
      'Travel', 'Food', 'Office', 'Software', 'Other'
    ].map(function (cat) {
      return '<option value="' + cat + '">' + cat + '</option>';
    }).join('');

    return (
      '<div class="modal-overlay" id="categorize-overlay">' +
        '<div class="modal">' +
          '<div class="modal-header">' +
            '<h3>Categorize Transaction' + (count > 1 ? 's' : '') + '</h3>' +
            '<button class="modal-close" id="modal-close">&times;</button>' +
          '</div>' +
          '<div class="modal-body">' +
            '<div class="modal-info">' +
              '<p class="modal-desc">"' + description + '"</p>' +
              (count > 1
                ? '<p class="modal-count">' + count + ' similar transactions &middot; ' + App.utils.formatters.currency(totalAmount) + ' total</p>'
                : '') +
            '</div>' +
            '<div class="modal-field">' +
              '<label>Category</label>' +
              '<select id="modal-category" class="modal-select">' +
                '<option value="">Select category...</option>' +
                categoriesHTML +
              '</select>' +
              '<input type="text" id="modal-category-custom" class="modal-input" placeholder="Or type a custom category...">' +
            '</div>' +
            '<div class="modal-field">' +
              '<label>Business</label>' +
              '<select id="modal-business" class="modal-select">' +
                '<option value="">Select business...</option>' +
                '<option value="Tech Work">Tech Work</option>' +
                '<option value="Freediving Work">Freediving Work</option>' +
                '<option value="Personal">Personal</option>' +
              '</select>' +
            '</div>' +
            '<div class="modal-field modal-remember">' +
              '<label class="modal-checkbox-label">' +
                '<input type="checkbox" id="modal-remember" checked>' +
                '<span>Remember this rule for future imports</span>' +
              '</label>' +
              '<p class="modal-remember-hint">Keyword: <strong>' + keyword + '</strong></p>' +
            '</div>' +
          '</div>' +
          '<div class="modal-footer">' +
            '<button class="btn btn--primary" id="modal-save">Apply' + (count > 1 ? ' to ' + count + ' transactions' : '') + '</button>' +
            '<button class="btn btn--secondary" id="modal-cancel">Cancel</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  },

  show: function (options, onSave) {
    var overlay = document.createElement('div');
    overlay.id = 'modal-container';
    overlay.innerHTML = this.render(options);
    document.body.appendChild(overlay);

    var modal = document.getElementById('categorize-overlay');

    // Close handlers
    function close() {
      var container = document.getElementById('modal-container');
      if (container) container.remove();
    }

    document.getElementById('modal-close').addEventListener('click', close);
    document.getElementById('modal-cancel').addEventListener('click', close);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) close();
    });

    // Custom category input overrides select
    var selectEl = document.getElementById('modal-category');
    var customEl = document.getElementById('modal-category-custom');

    customEl.addEventListener('input', function () {
      if (customEl.value) selectEl.value = '';
    });
    selectEl.addEventListener('change', function () {
      if (selectEl.value) customEl.value = '';
    });

    // Save handler
    document.getElementById('modal-save').addEventListener('click', function () {
      var category = customEl.value.trim() || selectEl.value;
      var business = document.getElementById('modal-business').value;
      var remember = document.getElementById('modal-remember').checked;

      if (!category) {
        selectEl.style.borderColor = 'var(--danger)';
        return;
      }
      if (!business) {
        document.getElementById('modal-business').style.borderColor = 'var(--danger)';
        return;
      }

      onSave({
        category: category,
        business: business,
        remember: remember,
        keyword: options.keyword
      });

      close();
    });
  }
};

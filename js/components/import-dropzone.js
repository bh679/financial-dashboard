var App = window.App || {};
App.components = App.components || {};

App.components.importDropzone = {
  render: function () {
    return (
      '<div class="dropzone" id="dropzone">' +
        '<svg class="dropzone-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>' +
        '</svg>' +
        '<p class="dropzone-text">Drag & drop your Revolut CSV here</p>' +
        '<p class="dropzone-hint">or click to browse</p>' +
        '<input type="file" id="csv-file-input" accept=".csv" class="dropzone-input">' +
      '</div>'
    );
  },

  bind: function (onFileSelected) {
    var dropzone = document.getElementById('dropzone');
    var fileInput = document.getElementById('csv-file-input');

    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', function () {
      fileInput.click();
    });

    fileInput.addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (file) onFileSelected(file);
    });

    dropzone.addEventListener('dragover', function (e) {
      e.preventDefault();
      dropzone.classList.add('dropzone--active');
    });

    dropzone.addEventListener('dragleave', function () {
      dropzone.classList.remove('dropzone--active');
    });

    dropzone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropzone.classList.remove('dropzone--active');
      var file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.csv')) {
        onFileSelected(file);
      }
    });
  }
};

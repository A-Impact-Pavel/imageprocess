(function () {
  var drop = document.getElementById("drop");
  var file = document.getElementById("file");
  var text = document.getElementById("dropText");

  function show(name) {
    if (name) {
      text.textContent = name;
      drop.classList.add("has-file");
    }
  }

  file.addEventListener("change", function () {
    if (file.files && file.files[0]) show(file.files[0].name);
  });

  ["dragenter", "dragover"].forEach(function (ev) {
    drop.addEventListener(ev, function (e) {
      e.preventDefault();
      drop.classList.add("dragover");
    });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    drop.addEventListener(ev, function (e) {
      e.preventDefault();
      drop.classList.remove("dragover");
    });
  });
  drop.addEventListener("drop", function (e) {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      file.files = e.dataTransfer.files;
      show(e.dataTransfer.files[0].name);
    }
  });
})();

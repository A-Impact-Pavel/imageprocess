(function () {
  var drop = document.getElementById("drop");
  var fileInput = document.getElementById("file");
  var dropText = document.getElementById("dropText");
  var editor = document.getElementById("editor");
  var preview = document.getElementById("preview");
  var origMeta = document.getElementById("origMeta");
  var resultMeta = document.getElementById("resultMeta");
  var errEl = document.getElementById("err");

  var percentControls = document.getElementById("percentControls");
  var pixelControls = document.getElementById("pixelControls");
  var percent = document.getElementById("percent");
  var percentOut = document.getElementById("percentOut");
  var widthEl = document.getElementById("width");
  var heightEl = document.getElementById("height");
  var keepAspect = document.getElementById("keepAspect");
  var downloadBtn = document.getElementById("download");
  var resetBtn = document.getElementById("reset");

  var img = new Image();
  var current = null; // { name, type, width, height }

  function fmtBytes(n) {
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
    return (n / (1024 * 1024)).toFixed(2) + " MB";
  }

  function selectedMode() {
    var checked = document.querySelector('input[name="mode"]:checked');
    return checked ? checked.value : "percent";
  }

  function readOpts() {
    var mode = selectedMode();
    if (mode === "percent") return { mode: "percent", percent: Number(percent.value) };
    return {
      mode: "pixels",
      width: widthEl.value,
      height: heightEl.value,
      keepAspect: keepAspect.checked,
    };
  }

  function showError(msg) {
    errEl.textContent = msg;
    errEl.hidden = false;
    resultMeta.textContent = "";
  }
  function clearError() {
    errEl.hidden = true;
    errEl.textContent = "";
  }

  function targetExt() {
    if (current.type === "image/png") return "png";
    if (current.type === "image/webp") return "webp";
    return "jpg";
  }
  function targetType() {
    if (current.type === "image/png") return "image/png";
    if (current.type === "image/webp") return "image/webp";
    return "image/jpeg";
  }

  function computeOrNull() {
    try {
      var dims = ResizeMath.computeDimensions(current.width, current.height, readOpts());
      clearError();
      return dims;
    } catch (e) {
      showError(e.message);
      return null;
    }
  }

  function updatePreviewMeta() {
    var dims = computeOrNull();
    if (!dims) return;
    resultMeta.textContent = "גודל חדש: " + dims.width + " × " + dims.height + " פיקסלים";
  }

  function render(dims, asBlob) {
    var canvas = document.createElement("canvas");
    canvas.width = dims.width;
    canvas.height = dims.height;
    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, dims.width, dims.height);
    if (asBlob) {
      return new Promise(function (resolve) {
        canvas.toBlob(resolve, targetType(), 0.92);
      });
    }
    return canvas;
  }

  function loadFile(file) {
    if (!file) return;
    if (!file.type || file.type.indexOf("image/") !== 0) {
      showError("נא לבחור קובץ תמונה.");
      return;
    }
    var url = URL.createObjectURL(file);
    img.onload = function () {
      current = { name: file.name, type: file.type, width: img.naturalWidth, height: img.naturalHeight, size: file.size };
      preview.src = url;
      origMeta.textContent =
        "מקור: " + img.naturalWidth + " × " + img.naturalHeight + " פיקסלים · " + fmtBytes(file.size);
      widthEl.value = img.naturalWidth;
      heightEl.value = img.naturalHeight;
      editor.hidden = false;
      dropText.textContent = file.name;
      drop.classList.add("has-file");
      clearError();
      updatePreviewMeta();
    };
    img.onerror = function () {
      showError("לא ניתן לפתוח את התמונה בדפדפן (ייתכן פורמט לא נתמך כמו HEIC). נסו JPG/PNG/WebP.");
    };
    img.src = url;
  }

  // --- events ---
  fileInput.addEventListener("change", function () {
    if (fileInput.files && fileInput.files[0]) loadFile(fileInput.files[0]);
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
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
  });

  document.querySelectorAll('input[name="mode"]').forEach(function (r) {
    r.addEventListener("change", function () {
      var pixels = selectedMode() === "pixels";
      percentControls.hidden = pixels;
      pixelControls.hidden = !pixels;
      updatePreviewMeta();
    });
  });

  percent.addEventListener("input", function () {
    percentOut.textContent = percent.value + "%";
    updatePreviewMeta();
  });

  function onPixelInput(changed) {
    if (keepAspect.checked && current) {
      var ratio = current.width / current.height;
      if (changed === "width" && widthEl.value) heightEl.value = Math.max(1, Math.round(Number(widthEl.value) / ratio));
      else if (changed === "height" && heightEl.value) widthEl.value = Math.max(1, Math.round(Number(heightEl.value) * ratio));
    }
    updatePreviewMeta();
  }
  widthEl.addEventListener("input", function () { onPixelInput("width"); });
  heightEl.addEventListener("input", function () { onPixelInput("height"); });
  keepAspect.addEventListener("change", updatePreviewMeta);

  downloadBtn.addEventListener("click", function () {
    var dims = computeOrNull();
    if (!dims) return;
    render(dims, true).then(function (blob) {
      if (!blob) {
        showError("נכשלה יצירת הקובץ.");
        return;
      }
      var a = document.createElement("a");
      var base = current.name.replace(/\.[^.]+$/, "");
      a.href = URL.createObjectURL(blob);
      a.download = base + "-" + dims.width + "x" + dims.height + "." + targetExt();
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    });
  });

  resetBtn.addEventListener("click", function () {
    editor.hidden = true;
    fileInput.value = "";
    dropText.textContent = "לחצו לבחירת תמונה, או גררו לכאן";
    drop.classList.remove("has-file");
    current = null;
  });
})();

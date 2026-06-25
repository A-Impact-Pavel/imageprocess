// Pure dimension math, shared by the browser and the tests.
// No DOM, no canvas — just numbers in, numbers out.
(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ResizeMath = api;
})(typeof self !== "undefined" ? self : this, function () {
  function clampPositive(n) {
    n = Math.round(n);
    return n < 1 ? 1 : n;
  }

  // origW, origH: original pixel dimensions (must be > 0).
  // opts.mode: "percent" | "pixels"
  //   percent: { percent: number }  -> scales both by percent.
  //   pixels:  { width?, height?, keepAspect: boolean }
  //     keepAspect true: use whichever of width/height is provided (width wins
  //       if both are given) and derive the other from the original ratio.
  //     keepAspect false: use width and height exactly as given (both required).
  function computeDimensions(origW, origH, opts) {
    if (!origW || !origH || origW < 1 || origH < 1) {
      throw new Error("Original dimensions must be positive numbers");
    }
    if (!opts || !opts.mode) throw new Error("opts.mode is required");

    if (opts.mode === "percent") {
      var p = Number(opts.percent);
      if (!isFinite(p) || p <= 0) throw new Error("percent must be > 0");
      return { width: clampPositive(origW * (p / 100)), height: clampPositive(origH * (p / 100)) };
    }

    if (opts.mode === "pixels") {
      var w = opts.width != null && opts.width !== "" ? Number(opts.width) : null;
      var h = opts.height != null && opts.height !== "" ? Number(opts.height) : null;
      var ratio = origW / origH;

      if (opts.keepAspect) {
        if (w && w > 0) return { width: clampPositive(w), height: clampPositive(w / ratio) };
        if (h && h > 0) return { width: clampPositive(h * ratio), height: clampPositive(h) };
        throw new Error("Provide a width or a height");
      }

      if (!w || w <= 0 || !h || h <= 0) {
        throw new Error("Provide both width and height (or enable keep aspect ratio)");
      }
      return { width: clampPositive(w), height: clampPositive(h) };
    }

    throw new Error("Unknown mode: " + opts.mode);
  }

  return { computeDimensions: computeDimensions };
});

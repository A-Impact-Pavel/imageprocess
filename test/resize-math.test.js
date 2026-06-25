const { test } = require("node:test");
const assert = require("node:assert");
const { computeDimensions } = require("../public/resize-math");

test("percent scales both dimensions", () => {
  assert.deepStrictEqual(computeDimensions(1000, 500, { mode: "percent", percent: 50 }), { width: 500, height: 250 });
  assert.deepStrictEqual(computeDimensions(1000, 500, { mode: "percent", percent: 200 }), { width: 2000, height: 1000 });
});

test("percent never goes below 1px", () => {
  assert.deepStrictEqual(computeDimensions(10, 10, { mode: "percent", percent: 1 }), { width: 1, height: 1 });
});

test("pixels with keepAspect derives height from width", () => {
  assert.deepStrictEqual(
    computeDimensions(1000, 500, { mode: "pixels", width: 400, height: "", keepAspect: true }),
    { width: 400, height: 200 }
  );
});

test("pixels with keepAspect derives width from height", () => {
  assert.deepStrictEqual(
    computeDimensions(1000, 500, { mode: "pixels", width: "", height: 100, keepAspect: true }),
    { width: 200, height: 100 }
  );
});

test("pixels with keepAspect prefers width when both given", () => {
  assert.deepStrictEqual(
    computeDimensions(1000, 500, { mode: "pixels", width: 800, height: 999, keepAspect: true }),
    { width: 800, height: 400 }
  );
});

test("pixels without keepAspect uses exact width and height", () => {
  assert.deepStrictEqual(
    computeDimensions(1000, 500, { mode: "pixels", width: 333, height: 777, keepAspect: false }),
    { width: 333, height: 777 }
  );
});

test("pixels without keepAspect requires both", () => {
  assert.throws(() => computeDimensions(1000, 500, { mode: "pixels", width: 100, height: "", keepAspect: false }));
});

test("invalid inputs throw", () => {
  assert.throws(() => computeDimensions(0, 500, { mode: "percent", percent: 50 }));
  assert.throws(() => computeDimensions(1000, 500, { mode: "percent", percent: 0 }));
  assert.throws(() => computeDimensions(1000, 500, { mode: "bogus" }));
  assert.throws(() => computeDimensions(1000, 500, { mode: "pixels", width: "", height: "", keepAspect: true }));
});

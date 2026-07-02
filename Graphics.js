/**
 * @constructor
 * @param {HTMLCanvasElement | string} [element]
 */
function GraphicsBase(element) {
  /** @type {HTMLCanvasElement?} */
  this.canvas = null;

  if (element instanceof HTMLCanvasElement) this.canvas = element;
  else if (typeof element === "string") {
    var canvas = document.getElementById(element);
    if (canvas instanceof HTMLCanvasElement) this.canvas = canvas;
  } else this.canvas = document.createElement("canvas");

  if (!this.canvas) return;

  var self = this;

  this.canvas.onresize = function() {
    if (!self.canvas) return;
    var bounds = self.canvas.getBoundingClientRect();
    self.resize(bounds.width, bounds.height);
  };
}

Object.defineProperty(GraphicsBase.prototype, "width", {
  get: function() { return this.canvas ? this.canvas.width : 0; },
  set: function(width) {
    if (typeof width === "number" && this.canvas)
      this.canvas.width = width;
  }
});

Object.defineProperty(GraphicsBase.prototype, "height", {
  get: function() { return this.canvas ? this.canvas.height : 0; },
  set: function(height) {
    if (typeof height === "number" && this.canvas)
      this.canvas.height = height;
  }
});

/**
 * @param {number} [width]
 * @param {number} [height]
 */
GraphicsBase.prototype.resize = function(width, height) {
  if (!this.canvas) return;

  if (typeof width === "undefined" || typeof height === "undefined") {
    const rect = this.canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
  }

  const dpr = window.devicePixelRatio || 1;
  this.width = width * dpr;
  this.height = height * dpr;
};

/**
 * @deprecated
 * @param {string} type
 */
GraphicsBase.prototype.getContext = function(type) {
  if (!this.canvas) return;
  return this.canvas.getContext(type);
};

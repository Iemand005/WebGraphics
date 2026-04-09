
/**
 * @constructor
 * @param {HTMLCanvasElement | string} [element]
 */
function GraphicsBase(element) {
  /** @type {HTMLCanvasElement?} */
  this.canvas = null;

  if (element instanceof HTMLCanvasElement)
    this.canvas = element;
  else if (typeof element === "string") {
    var canvas = document.getElementById(element);
    if (canvas instanceof HTMLCanvasElement) this.canvas = canvas;
  } else this.canvas = document.createElement("canvas")
  
  if (!this.canvas) return;

  var self = this;

  this.canvas.onresize = function () {
    if (!self.canvas) return;
    var bounds = self.canvas.getBoundingClientRect();
    self.resize(bounds.width, bounds.height);
  }
}

/**
 * @param {number} width
 * @param {number} height
 */
GraphicsBase.prototype.resize = function (width, height) {
  if (!this.canvas) return;
  this.canvas.width = width;
  this.canvas.height = height;
}

/**
 * @deprecated
 * @param {string} type
 */
GraphicsBase.prototype.getContext = function (type) {
  if (!this.canvas) return;
  return this.canvas.getContext(type);
}



/**
 * @constructor
 * @param {HTMLCanvasElement | string} [element]
 */
function GraphicsBase(element) {
  /** @type {HTMLCanvasElement?} */
  this.canvas = null;

  if (element instanceof HTMLCanvasElement)
    this.canvas = element;
  else
    var element = typeof element === "string" ? document.getElementById(element) : document.createElement("canvas");
  // this.canvas = (
  //   element instanceof HTMLCanvasElement
  //   ? element
  //   : (
  //     typeof element == "string"
  //     ? document.getElementById(element)
  //     : document.createElement("canvas")
  //   ));
  
  this.canvas.onresize = function () {
    var bounds = canvas.getBoundingClientRect();
    graphics.resize(bounds.width, bounds.height);
  }
}

GraphicsBase.prototype.resize = function (width, height) {
  this.canvas.width = width;
  this.canvas.height = height;
}

GraphicsBase.prototype.getContext = function (type) {
  return this.canvas.getContext(type);
}


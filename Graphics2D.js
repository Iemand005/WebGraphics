
/**
 * @constructor
 * @param {string | HTMLCanvasElement} [element] 
 * @this {Graphics2D & GraphicsBase}
 */
function Graphics2D(element) {
  GraphicsBase.call(this, element);
  if (!this.canvas) throw new Error("Canvas not found");
  this.ctx = this.canvas.getContext("2d");
}

Graphics2D.prototype = Object.create(GraphicsBase.prototype);
Graphics2D.prototype.constructor = Graphics2D;
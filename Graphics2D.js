
/**
 * @constructor
 * @extends {GraphicsBase}
 * @param {string | HTMLCanvasElement | null} element 
 */
function Graphics2D(element) {
  GraphicsBase.call(this, element);
  this.ctx = this.getContext("2d");
}
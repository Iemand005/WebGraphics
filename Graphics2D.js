
/**
 * @constructor
 * @class
 * @param {CanvasLike} [element]
 * @param {CanvasContext} [context]
 */
function Graphics2D(element, context) {
	GraphicsBase.call(this, element, context);
	const ctx = this.canvas.getContext("2d");
	if (!ctx) throw new Error("No 2d graphics??");
	this.ctx = ctx;
}

Graphics2D.prototype = Object.create(GraphicsBase.prototype);
Graphics2D.prototype.constructor = Graphics2D;

/**
 * @param {number} [width]
 * @param {number} [height]
 */
Graphics2D.prototype.resize = function (width, height) {
	const dpr = GraphicsBase.prototype.resize.call(this, width, height);
	this.ctx.scale(dpr, dpr);
	return dpr;
};
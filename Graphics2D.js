
/**
 * @constructor
 * @this {Graphics2D}
 * @param {string | HTMLCanvasElement} [element] 
 */
function Graphics2D(element) {
	GraphicsBase.call(this, element);
	if (!this.canvas) throw new Error("Canvas not found");
	const ctx = this.canvas.getContext("2d");
	if (ctx) this.ctx = ctx;
}

Graphics2D.prototype = Object.create(GraphicsBase.prototype);
Graphics2D.prototype.constructor = Graphics2D;
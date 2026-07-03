
/**
 * @constructor
 * @this {Graphics2D}
 * @param {string | HTMLCanvasElement} [element] 
 */
function Graphics2D(element) {
	GraphicsBase.call(this, element);
	if (!this.canvas) throw new Error("Canvas not found");
	const ctx = this.canvas.getContext("2d");
	if (!ctx) throw new Error("No 2d graphics??");
	/** @type {CanvasRenderingContext2D} */
	this.ctx = ctx;

	var self  = this;
	this.canvas.onresize = function() {
		self.resize();
	}
}

Graphics2D.prototype = Object.create(GraphicsBase.prototype);
Graphics2D.prototype.constructor = Graphics2D;
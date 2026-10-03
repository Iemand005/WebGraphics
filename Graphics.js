/**
 * @class
 * @param {HTMLCanvasElement | string} [element]
 */
function GraphicsBase(element) {
	/** @type {HTMLCanvasElement | null} */
	var canvas = null;

	if (element instanceof HTMLCanvasElement) canvas = element;
	else if (typeof element === "string") {
		var c = document.getElementById(element);
		if (c instanceof HTMLCanvasElement) canvas = c;
	} else canvas = document.createElement("canvas");

	if (!canvas) throw new Error("Object does not resolve to a canvas!");

	/** @type {HTMLCanvasElement} */
	this.canvas = canvas;

	var self = this;

	this.canvas.onresize = function() { self.resize(); };
}

Object.defineProperty(GraphicsBase.prototype, "width", {
	get: function() { return this.canvas.width; },
	set: function(width) {
		if (typeof width === "number" && this.canvas)
			this.canvas.width = width;
	}
});

Object.defineProperty(GraphicsBase.prototype, "height", {
	get: function() { return this.canvas.height; },
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
	if (typeof width === "undefined" || typeof height === "undefined") {
		const rect = this.canvas.getBoundingClientRect();
		width = rect.width;
		height = rect.height;
	}

	const dpr = window.devicePixelRatio || 1;
	this.width = width * dpr;
	this.height = height * dpr;
};

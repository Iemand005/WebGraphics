/**
 * @constructor
 * @class
 * @param {CanvasLike} [element]
 * @param {CanvasContext} [context]
 */
function GraphicsBase(element, context) {
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

	/** @type {RenderingContext | CanvasRenderingContext2D | WebGL2RenderingContext | WebGLRenderingContext | null} */
	this.ctx = context ? canvas.getContext(context) : null;
}///

Object.defineProperty(GraphicsBase.prototype, "width", {
	get: function() { return this.canvas.width; },
	set: function(width) {
		if (typeof width === "number")
			this.canvas.width = width;
	}
});

Object.defineProperty(GraphicsBase.prototype, "height", {
	get: function() { return this.canvas.height; },
	set: function(height) {
		if (typeof height === "number")
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
	return dpr;
};

/**
 * @param {string} data
 * @param {string} [filename]
 */
GraphicsBase.prototype.downloadImage = function(data, filename) {
	var a = document.createElement('a');
	a.href = data;
	a.download = filename || 'untitled.jpeg';
	document.body.appendChild(a);
	a.click();
}


/**
 * @param {"png" | "jpeg" | "webp"} [type]  'png' | 'jpeg' | 'jpg' | 'webp' or a full mime type
 * @param {number} [quality]  0 to 1, used by jpeg and webp only
 */
GraphicsBase.prototype.getDataUrl = function(type, quality) {
	return this.canvas.toDataURL("image/" + (type || "png") , quality || 1);
};

/**
 * @param {string} [filename]
 */
GraphicsBase.prototype.downloadCanvas = function(filename) {
	this.downloadImage(this.getDataUrl(), filename);
}

class ScreenShooter extends CanvasMaker {

	constructor() {
		super(new OffscreenCanvas(1000, 1000), "2d");
	}

	/** @param {HTMLElement} element */
	screenshotElement(element) {
		const bounds = element.getBoundingClientRect();
		const cssW = Math.ceil(bounds.width);
		const cssH = Math.ceil(bounds.height);
		this.resize(cssW, cssH);
		const parent = element.parentElement;
		this.insertElement(element);
		document.body.appendChild(this.canvas);
		this.canvas.style.width = cssW + "px";
		this.canvas.style.height = cssH + "px";
		var downloaded = false;
		this.canvas.onpaint = () => {
			if (!(this.ctx instanceof CanvasRenderingContext2D)) return;
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			
			const transform = this.ctx.drawElementImage(element, 0, 0);
			// element.style.transform = transform.toString();
			if (downloaded) return;
			downloaded = true;
			this.downloadCanvas();
			// parent?.appendChild(element);
		};

		this.canvas.requestPaint();
		// this.downloadCanvas();
	}
}
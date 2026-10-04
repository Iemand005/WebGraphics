
class ScreenShooter extends CanvasMaker {

	constructor() {
		super(new OffscreenCanvas(100, 100), "2d");
	}

	/** @param {HTMLElement} element */
	screenshotElement(element) {
		const parent = element.parentElement;
		this.insertElement(element);
		document.body.appendChild(this.canvas)
		this.canvas.onpaint = () => {
			if (!(this.ctx instanceof CanvasRenderingContext2D)) return;
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

			const transform = this.ctx.drawElementImage(element, 0, 0);
			element.style.transform = transform.toString();

			this.ctx.strokeStyle = 'red';
			this.ctx.strokeRect(10, 10, 100, 100);
		};

		this.canvas.requestPaint();
		this.downloadCanvas();
		parent?.appendChild(element);
	}
}
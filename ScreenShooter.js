
class ScreenShooter extends CanvasMaker {

	constructor() {
		super(new OffscreenCanvas(100, 100), "2d");
	}

	/** @param {Element} element */
	screenshotElement(element) {
		const parent = element.parentElement;
		this.insertElement(element);
		this.downloadCanvas();
		parent?.appendChild(element);
	}
}
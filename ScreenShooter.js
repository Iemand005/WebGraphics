
class ScreenShooter extends CanvasMaker {
	/** @param {Element} element */
	screenshotElement(element) {
		const parent = element.parentElement;
		this.insertElement(element);
		this.downloadCanvas();
		parent?.appendChild(element);
	}
}

class ScreenShooter extends CanvasMaker {
	/** @param {Element} element */
	screenshotElement(element) {
		this.insertElement(element);
		this.downloadImage(this.getDataUrl())
	}
}

class ScreenShooter extends CanvasMaker {
	/** @param {Element} element */
	screenshotElement(element) {
		this.insertElement(element);
	}

	screenshotCanvas() {
		
	}

	downloadImage(data, filename = 'untitled.jpeg') {
		var a = document.createElement('a');
		a.href = data;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
	}
}
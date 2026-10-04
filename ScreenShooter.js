
class ScreenShooter extends CanvasMaker {

	constructor() {
		super(new OffscreenCanvas(1000, 1000), "2d");
	}

	/** @param {HTMLElement} element */
	screenshotElement(element) {
		const bounds = element.getBoundingClientRect();
		const cssW = Math.ceil(bounds.width);
		const cssH = Math.ceil(bounds.height);
		const dpr = this.resize(cssW, cssH);

		const parent = element.parentElement;
		const nextSibling = element.nextSibling;

		document.body.appendChild(this.canvas);
		this.canvas.style.width = cssW + "px";
		this.canvas.style.height = cssH + "px";

		const move = (newParent, ref = null) => {
			if (typeof newParent.moveBefore === "function") {
				newParent.moveBefore(element, ref); // no reload
				return false; // didn't reload
			}
			newParent.insertBefore(element, ref);
			return true; // iframes will reload
		};

		const reloaded = move(this.canvas);

		const restore = () => {
			if (nextSibling?.parentNode === parent) move(parent, nextSibling);
			else move(parent, null);
			this.canvas.remove();
		};

		const ready = async () => {
			if (reloaded) {
				const frames = element.querySelectorAll("iframe");
				await Promise.all([...frames].map(f => new Promise(res => {
					f.addEventListener("load", res, { once: true });
				})));
			}
			await document.fonts.ready;
			await Promise.all([...element.querySelectorAll("img")].map(i => i.decode().catch(() => {})));
		};

		let done = false;
		this.canvas.onpaint = () => {
			if (done) return;
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.drawElementImage(element, 0, 0);
		};

		ready().then(async () => {
			this.canvas.requestPaint();
			await new Promise(res => {
				const prev = this.canvas.onpaint;
				this.canvas.onpaint = (e) => { prev(e); res(); };
				this.canvas.requestPaint();
			});
			done = true;
			await this.downloadCanvas();
			restore();
		});
	}
}
class ScreenShooter extends CanvasMaker {
	constructor() {
		super(new OffscreenCanvas(1000, 1000), "2d");
	}

	async screenshotElement(element, { debug = false } = {}) {
		if (typeof CanvasRenderingContext2D.prototype.drawElementImage !== "function")
			throw new Error("html-in-canvas unavailable");

		const rect = element.getBoundingClientRect();
		const cssW = Math.max(1, Math.ceil(rect.width));
		const cssH = Math.max(1, Math.ceil(rect.height));
		const dpr = this.resize(cssW, cssH);

		const mount = document.createElement("canvas");
		mount.setAttribute("layoutsubtree", "");
		mount.width = cssW * dpr;
		mount.height = cssH * dpr;
		mount.style.cssText =
			`position:fixed;top:0;left:0;width:${cssW}px;height:${cssH}px;` +
			`z-index:-2147483647;pointer-events:none`;

		document.body.appendChild(mount);

		const mountCtx = mount.getContext("2d");
		const parent = element.parentNode;
		const placeholder = document.createComment("");
		parent.insertBefore(placeholder, element);

		const style = element.getAttribute("style");
		const drawable = element.hasAttribute("drawable");

		try {
			element.setAttribute("drawable", "");

			if (element instanceof HTMLElement) {
				Object.assign(element.style, {
					boxSizing: "border-box",
					width: `${cssW}px`,
					height: `${cssH}px`,
					minWidth: `${cssW}px`,
					maxWidth: `${cssW}px`,
					minHeight: `${cssH}px`,
					maxHeight: `${cssH}px`,
					margin: "0",
					flex: "none"
				});
			}

			await document.fonts.ready;
			await new Promise(requestAnimationFrame);
			await new Promise(requestAnimationFrame);

			if (typeof mount.requestPaint === "function") {
				await new Promise(resolve => {
					const timeout = setTimeout(resolve, 300);
					mount.addEventListener("paint", () => {
						clearTimeout(timeout);
						resolve();
					}, { once: true });
					mount.requestPaint();
				});
			}

			// Final move. Nothing async after this.
			if (typeof mount.moveBefore === "function") {
				try {
					mount.moveBefore(element, null);
				} catch {
					mount.appendChild(element);
				}
			} else {
				mount.appendChild(element);
			}

			// Do not await/yield between the move and drawElementImage.
			mountCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
			mountCtx.clearRect(0, 0, cssW, cssH);
			mountCtx.drawElementImage(element, 0, 0, cssW, cssH);

			this.ctx.setTransform(1, 0, 0, 1, 0, 0);
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.drawImage(mount, 0, 0);

			await this.downloadCanvas();
		} finally {
			parent.insertBefore(element, placeholder);
			placeholder.remove();

			if (style === null)
				element.removeAttribute("style");
			else
				element.setAttribute("style", style);

			if (!drawable)
				element.removeAttribute("drawable");

			mount.remove();
		}
	}
}
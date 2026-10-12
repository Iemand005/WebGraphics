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
		const outW = this.canvas.width;
		const outH = this.canvas.height;

		const mount = document.createElement("canvas");
		mount.setAttribute("layoutsubtree", "");
		mount.width = outW;
		mount.height = outH;
		mount.style.cssText =
			`position:fixed;top:0;left:0;width:${cssW}px;height:${cssH}px;` +
			`z-index:-2147483647;pointer-events:none`;

		document.body.appendChild(mount);

		const mountCtx = mount.getContext("2d");
		const parent = element.parentNode;
		const placeholder = document.createComment("screenshot-placeholder");
		parent.insertBefore(placeholder, element);

		const savedStyle = element.getAttribute("style");
		const hadDrawable = element.hasAttribute("drawable");

		/** @param {HTMLElement} to @param {HTMLElement | null} [ref] */
		const move = (to, ref) => {
			if (typeof to.moveBefore !== "function")
				throw new Error("moveBefore() unavailable");

			to.moveBefore(element, ref || null);
		};

		const frame = () => new Promise(resolve => {
			requestAnimationFrame(() => {
				setTimeout(resolve, 50);
			});
		});

		try {
			move(mount);

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
			await frame();
			await frame();

			mountCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
			mountCtx.drawElementImage(element, 0, 0, cssW, cssH);

			this.ctx.setTransform(1, 0, 0, 1, 0, 0);
			this.ctx.clearRect(0, 0, outW, outH);
			this.ctx.drawImage(mount, 0, 0);

			this.downloadCanvas();
		} finally {
			move(parent, placeholder);
			placeholder.remove();

			if (savedStyle === null)
				element.removeAttribute("style");
			else
				element.setAttribute("style", savedStyle);

			if (!hadDrawable)
				element.removeAttribute("drawable");

			mount.remove();
		}
	}
}
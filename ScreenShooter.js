
class ScreenShooter extends CanvasMaker {

	constructor() {
		super(new OffscreenCanvas(1000, 1000), "2d");
	}

	/**
	 * @param {HTMLElement} element
	 * @param {{ debug?: boolean }} [opts]
	 */
	async screenshotElement(element, { debug = false } = {}) {
		if (typeof CanvasRenderingContext2D.prototype.drawElementImage !== "function") {
			throw new Error("html-in-canvas unavailable (Chrome 148+, chrome://flags/#canvas-draw-element)");
		}

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
		mount.style.cssText = `position:fixed;top:0;left:0;width:${cssW}px;height:${cssH}px;z-index:-2147483647;pointer-events:none`;
		document.body.appendChild(mount); // must be connected BEFORE moveBefore

		const parent = element.parentNode;
		const placeholder = document.createComment("screenshot-placeholder");
		parent.insertBefore(placeholder, element);

		const savedStyle = element.getAttribute("style");
		const hadDrawable = element.hasAttribute("drawable");
		const iframes = [...element.querySelectorAll("iframe")];

		if (debug) for (const f of iframes) { try { f.contentWindow.__ssAlive = true; } catch {} }

		/** Moves without reload when possible. Returns true if state was preserved. */
		const move = (to, ref) => {
			if (typeof to.moveBefore === "function") {
				try { to.moveBefore(element, ref); return true; }
				catch (err) { console.warn("moveBefore failed, falling back to insertBefore:", err); }
			}
			to.insertBefore(element, ref);
			return false;
		};

		try {
			const preserved = move(mount, null);
			const reloadWaits = preserved ? [] : iframes.map(f => new Promise(res => {
				f.addEventListener("load", res, { once: true });
				setTimeout(res, 5000);
			}));

			if (debug) {
				console.log("moveBefore preserved:", preserved);
				for (const f of iframes) {
					try { console.log("iframe survived:", f.contentWindow?.__ssAlive === true); }
					catch { console.log("iframe is cross-origin, can't verify"); }
				}
			}

			element.setAttribute("drawable", "");
			Object.assign(element.style, {
				boxSizing: "border-box",
				width: cssW + "px", height: cssH + "px",
				minWidth: cssW + "px", maxWidth: cssW + "px",
				minHeight: cssH + "px", maxHeight: cssH + "px",
				margin: "0", flex: "none",
			});

			const frame = () => new Promise(r => { requestAnimationFrame(r); setTimeout(r, 50); });
			await Promise.all([...reloadWaits, document.fonts.ready]);
			await frame();
			await frame();
			await new Promise(resolve => {
				const t = setTimeout(resolve, 300);
				mount.addEventListener("paint", () => { clearTimeout(t); resolve(); }, { once: true });
				mount.requestPaint();
			});

			const mctx = mount.getContext("2d");
			mctx.scale(dpr, dpr);
			mctx.drawElementImage(element, 0, 0, cssW, cssH);

			this.ctx.save();
			this.ctx.setTransform(1, 0, 0, 1, 0, 0);
			this.ctx.clearRect(0, 0, outW, outH);
			this.ctx.drawImage(mount, 0, 0);
			this.ctx.restore();

			await this.downloadCanvas();
		} finally {
			move(parent, placeholder);
			placeholder.remove();
			if (savedStyle === null) element.removeAttribute("style");
			else element.setAttribute("style", savedStyle);
			if (!hadDrawable) element.removeAttribute("drawable");
			mount.remove();
		}
	}
}
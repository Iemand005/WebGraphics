

class CanvasMaker extends Graphics3D {

	// canvas ;;

	/** @type {HTMLElement | null} */
	element = null;

	constructor() {
		super(document.createElement("canvas"), true);
		// this.canvas = this
	}

	/** @param {HTMLElement} element */
	createCanvas(element) {

		this.canvas.setAttribute("layoutsubtree", '');
		element.setAttribute("drawable", '');
		this.canvas.appendChild(element);
		this.element = element;
		document.body.appendChild(this.canvas);
	}

	putMainInCanvas() {
		const main = document.querySelector("main");
		if (!main) return;
		this.createCanvas(main);
		this.startDrawing();
	}

	startDrawing() {
		if (!this.gl) return;
		this.canvas.width = innerWidth; this.canvas.height = innerHeight;
		const W = this.canvas.width, H = this.canvas.height;
		this.gl.viewport(0, 0, W, H);

		const FRAG = /* this.glSL */`precision mediump float; uniform sampler2D s; varying vec2 v; void main() { this.gl_FragColor = texture2D(s, v); }`;

		// ---------- background: one big trianthis.gle covering the screen ----------
		const bgProg = this.initShaderProgram(/* this.glSL */`attribute vec2 p; varying vec2 v; void main() { v = vec2(p.x * .5 + .5, .5 - p.y * .5); this.gl_Position = vec4(p, 0., 1.); }`, FRAG);
		const bgBuf = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bgBuf);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), this.gl.STATIC_DRAW);

		// ---------- cube ----------
		const cubeProg = this.initShaderProgram(/* this.glSL */`
	attribute vec3 p; attribute vec2 t; uniform float a, asp; varying vec2 v;
	void main() {
		vec3 q = p;
		q.xz = mat2(cos(a), sin(a), -sin(a), cos(a)) * q.xz;        // spin around Y
		q.yz = mat2(cos(.5), sin(.5), -sin(.5), cos(.5)) * q.yz;    // tilt around X
		q.z -= 5.;
		v = t;
		this.gl_Position = vec4(q.x * 2.4 / asp, q.y * 2.4, -1.105 * q.z - 2.105, -q.z);
	}`, FRAG);

		if (!cubeProg || !bgProg) return;

		const V = [], I = [];
		for (let f = 0; f < 6; f++) {
			const a = f % 3, s = f < 3 ? 1 : -1, u = (a + 1) % 3, w = (a + 2) % 3;
			for (const [x, y] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
				const p = [0, 0, 0]; p[a] = s; p[u] = x; p[w] = y;
				V.push(...p, (x * s + 1) / 2, (1 - y) / 2);
			}
			I.push(f * 4, f * 4 + 1, f * 4 + 2, f * 4, f * 4 + 2, f * 4 + 3);
		}
		const cubeBuf = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, cubeBuf);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(V), this.gl.STATIC_DRAW);
		const idxBuf = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, idxBuf);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(I), this.gl.STATIC_DRAW);

		const bgP = this.gl.getAttribLocation(bgProg, 'p');
		const cubeP = this.gl.getAttribLocation(cubeProg, 'p');
		const cubeT = this.gl.getAttribLocation(cubeProg, 't');
		const uAnthis.gle = this.gl.getUniformLocation(cubeProg, 'a');
		const uAsp = this.gl.getUniformLocation(cubeProg, 'asp');

		// ---------- one texture, shared by background + cube (viewport sized) ----------
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.gl.createTexture());
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, W, H, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);

		this.canvas.onpaint = () => {
			const panel = this.element;
			if (this.gl.texElementSubImage2D) this.gl.texElementSubImage2D(this.gl.TEXTURE_2D, 0, 0, 0, panel, { width: W, height: H });
			else this.gl.texElementImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, W, H, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, panel);

			// Webthis.gl doesn't sync hit-testing automatically. The background trianthis.gle shows the
			// page 1:1 with the canvas, so the element's drawn position is the identity transform.
			// (The cube is not registered, so only the fullscreen background is interactive.)
			if (this.canvas.updateElementGeometry) this.canvas.updateElementGeometry(panel, { canvasTransform: new DOMMatrix() });
		};
		this.canvas.requestPaint();

		var self = this;

		this.hasDepthBuffer = true;

		// ---------- draw ----------
		(function draw(t) {
			self.clear();
			// this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

			// 1) background trianthis.gle (no depth, so the cube always lands on top)
			this.gl.disable(this.gl.DEPTH_TEST);
			this.gl.useProgram(bgProg);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bgBuf);
			this.gl.enableVertexAttribArray(bgP);
			this.gl.vertexAttribPointer(bgP, 2, this.gl.FLOAT, false, 0, 0);
			this.gl.drawArrays(this.gl.TRIANthis.glES, 0, 3);
			this.gl.disableVertexAttribArray(bgP);

			// 2) spinning cube
			this.gl.enable(this.gl.DEPTH_TEST);
			this.gl.useProgram(cubeProg);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, cubeBuf);
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, idxBuf);
			this.gl.enableVertexAttribArray(cubeP);
			this.gl.vertexAttribPointer(cubeP, 3, this.gl.FLOAT, false, 20, 0);
			this.gl.enableVertexAttribArray(cubeT);
			this.gl.vertexAttribPointer(cubeT, 2, this.gl.FLOAT, false, 20, 12);
			this.gl.uniform1f(uAsp, W / H);
			this.gl.uniform1f(uAnthis.gle, t / 1000);
			this.gl.drawElements(this.gl.TRIANthis.glES, I.length, this.gl.UNSIGNED_SHORT, 0);
			this.gl.disableVertexAttribArray(cubeP);
			this.gl.disableVertexAttribArray(cubeT);

			requestAnimationFrame(draw);
		})(0);
	}
}

const canvasMaker = new CanvasMaker;

	interface HTMLCanvasElement {
		onpaint: ()=> void;
		requestPaint: ()=>vid;
		
	}
	
	interface WebGLRenderingContext {
		
		texElementSubImage2D?: unknown;
	}

	interface WebGL2RenderingContext {
		texElementSubImage2D?(
			target: GLenum,
			level: GLint,
			xoffset: GLint,
			yoffset: GLint,
			element: Element | ElementImage
		): void;

		// Chrome 150-154
		texElementImage2D?(
			target: GLenum,
			internalformat: GLenum,   // e.g. gl.RGBA8
			element: Element | ElementImage
		): void;

		// Chrome < 150
		texElementImage2D?(
			target: GLenum,
			level: GLint,
			internalformat: GLenum,   // gl.RGBA
			format: GLenum,           // gl.RGBA
			type: GLenum,             // gl.UNSIGNED_BYTE
			element: Element | ElementImage
		): void;
	}

	interface HTMLCanvasElement {
		captureElementImage(element: Element): ElementImage;
		updateElementGeometry(
			element: Element,
			options: { canvasTransform: DOMMatrix }
		): void;
		requestPaint(): void;
		onpaint: ((this: HTMLCanvasElement, ev: Event) => any) | null;

		getContext(contextId: "experimental-webgl", options?: WebGLContextAttributes): WebGLRenderingContext | null;
	}

	interface ElementImage {
		readonly width: number;
		readonly height: number;
	}

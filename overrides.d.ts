export {};

declare global {
	interface HTMLCanvasElement {
		onpaint: ()=> void;
		requestPaint: ()=>vid;
		
	}
	
	interface WebGLRenderingContext {
		
		texElementSubImage2D?: unknown;
	}

	interface WebGL2RenderingContext {
		texElementSubImage2D(
			target: GLenum,
			level: GLint,
			xoffset: GLint,
			yoffset: GLint,
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
	}

	interface ElementImage {
		readonly width: number;
		readonly height: number;
	}

}
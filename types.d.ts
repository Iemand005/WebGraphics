interface GraphicsBase {}

interface Graphics2D extends GraphicsBase {}
interface Graphics3D extends GraphicsBase {}

type CanvasLike = string | HTMLCanvasElement | OffscreenCanvas;

type CanvasContext = "2d" | "webgl" | "webgl2";

declare function GraphicsBase(element?: CanvasLike, context?: CanvasContext): GraphicsBase;
declare function Graphics2D(element?: CanvasLike, context?: CanvasContext): Graphics2D;
declare function Graphics3D(element?: CanvasLike, context?: CanvasContext): Graphics3D;



interface HTMLCanvasElement {
	onpaint: ()=> void;
	requestPaint: ()=>vid;
	
}

interface WebGLRenderingContextBase {
	texElementSubImage2D?(
		target: GLenum,
		level: GLint,
		xoffset: GLint,
		yoffset: GLint,
		element: Element | ElementImage
	): void;

	// 155+ with explicit size (the WICG issue mentions width/height params)
	texElementSubImage2D?(
		target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint,
		element: Element | ElementImage,
		size?: { width: number; height: number }
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

	texElementImage2D?(
		target: GLenum, level: GLint, internalformat: GLenum,
		width: GLsizei, height: GLsizei, border: GLint,
		format: GLenum, type: GLenum,
		element: Element | ElementImage
	): void;
}

interface CanvasRenderingContext2D {
	drawElementImage(element: Element | ElementImage, x: number, y: number): DOMMatrix;
	drawElementImage(element: Element | ElementImage, x: number, y: number, width: number, height: number): DOMMatrix;
}

interface HTMLCanvasElement {
	captureElementImage?(element: Element): ElementImage;
	updateElementGeometry?(
		element: Element,
		options: { canvasTransform: DOMMatrix }
	): void;
	requestPaint?(): void;
	onpaint?(this: HTMLCanvasElement, ev: Event): void;

	getContext(contextId: "experimental-webgl", options?: WebGLContextAttributes): WebGLRenderingContext | null;
}

interface ElementImage {
	readonly width: number;
	readonly height: number;
}

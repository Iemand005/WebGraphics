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
		
		texElementSubImage2D?: unknown;
	}

}
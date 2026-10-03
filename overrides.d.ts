export {};

declare global {
	interface HTMLCanvasElement {
		onpaint: ()=> void;
		requestPaint: ()=>vid;
		texElementSubImage2D?: unknown;

	}

}
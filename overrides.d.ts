export {};

declare global {
	interface HTMLCanvasElement {
		onpaint: ()=> void;

	}

}
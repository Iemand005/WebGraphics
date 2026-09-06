interface GraphicsBase {
	canvas: HTMLCanvasElement;
}

interface Graphics2D extends GraphicsBase {
	ctx: CanvasRenderingContext2D;
	resize();
}

interface Graphics3D extends GraphicsBase {
	ctx: CanvasRenderingContext2D;
	resize();
}

declare function GraphicsBase(): GraphicsBase;
declare function Graphics2D(): Graphics2D;
declare function Graphics3D(): Graphics3D;
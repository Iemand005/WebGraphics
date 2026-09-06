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

declare function GraphicsBase(element?: string | HTMLCanvasElement): GraphicsBase;
declare function Graphics2D(element?: string | HTMLCanvasElement): Graphics2D;
declare function Graphics3D(element?: string | HTMLCanvasElement): Graphics3D;
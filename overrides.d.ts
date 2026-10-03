export {};

declare global {
	interface HTMLCanvasElement {
		MSInputMethodContext: unknown | undefined;
		documentMode:  | undefined;

		documentPictureInPicture: DocumentPictureInPicture | undefined;

		inspect?: (value: any) => void;

		GearsFactory?: unknown;


		appManager?: AppManager;
		windowManager?: WindowManager;
		windows?: Dialog[];

		__LVMessengerReceive?: (type: MessageType, data: any, source?: string) => void;
		__LVMessenger?: {
			accent?: HTMLMetaElement;
		};

		desktopManager?: DesktopManager;

		metaThemeColor?: HTMLMetaElement;

	}

}
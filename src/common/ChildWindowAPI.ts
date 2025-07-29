import { SpawnParams, WindowIdentifier } from "@finsemble/finsemble-core";

const dropdownWindowHandle = "dropdown-container-async";

interface ChildWindowInstance {
	handle: string;
	windowIdentifier: WindowIdentifier;
}

export type ChildWindowCreationOptions = { 
    componentId?: string; 
    position?: Point; 
    size?: Size; 
    url?: string; 
    transparent?: boolean; 
    positionType?: any; 
    parentContainerId?: any; 
    showWindowHeader?: boolean;
    autoShow?: boolean;
    componentParams?: any;
}

export type Point = {
    x: number;
    y: number;
}

export type Size = {
    h: number;
    w: number;
};

export type Rect = Point & Size;

export type ShowOptions = {
    position?: Point;
    focus?: boolean;
    bringToFront?: boolean;
};

export class ChildWindowAPI {
	private childWindows: Record<string, ChildWindowInstance> = {};

	constructor(private finsemble: typeof FSBL) {}

	async isShowing(handle: string): Promise<boolean> {
		const { wrap } = await this.finsemble.FinsembleWindow.getInstance({
			windowName: handle,
		});

		return new Promise((resolve) => {
			wrap.isShowing({}, (err, data) => {
				resolve(data);
			});
		});
	}

	async isAlwaysOnTop(handle: string): Promise<boolean> {
		const { wrap } = await this.finsemble.FinsembleWindow.getInstance({
			windowName: handle,
		});

		return new Promise((resolve) => {
			wrap.isAlwaysOnTop({}, (err, data) => {
				resolve(data);
			});
		});
	}

	async setAlwaysOnTop(handle: string, value: boolean): Promise<void> {
		const { wrap } = await this.finsemble.FinsembleWindow.getInstance({
			windowName: handle,
		});

		await wrap.setAlwaysOnTop({ alwaysOnTop: value });
	}

	async blur(handle: string): Promise<void> {
		const { wrap } = await this.finsemble.FinsembleWindow.getInstance({
			windowName: handle,
		});

		await wrap.blur();
	}

	async createWindow(options: ChildWindowCreationOptions): Promise<string> {
		const spawnOptions: SpawnParams = {
			name: dropdownWindowHandle,
			left: options.position?.x,
			top: options.position?.y,
			width: options.size?.w,
			height: options.size?.h,
			options: {
				autoShow: false,
			},
		};

		const { componentParams } = options;

		if (options.url) {
			spawnOptions.url = options.url;
		}

		if (options.transparent && spawnOptions.options) {
			spawnOptions.options = {
				...spawnOptions.options,
				transparent: options.transparent,
			};
		}

		if (options.positionType) {
			spawnOptions.position = options.positionType;
		}
		if (options.parentContainerId) {
			spawnOptions.relativeWindow = {
				windowName: options.parentContainerId,
			};
		}
		let componentType = options.showWindowHeader
			? "webWindowComponent"
			: "childWindowComponent";

		if (
			componentParams &&
			typeof componentParams === "object" &&
			"componentType" in componentParams &&
			typeof componentParams.componentType === "string"
		) {
			componentType = componentParams.componentType;
		}

		const spawnResult = await this.finsemble.Clients.LauncherClient.spawn(
			componentType,
			spawnOptions
		);

		if (spawnResult.error || !spawnResult.response) {
			return Promise.reject();
		}

		const newHandle = spawnResult.response.windowIdentifier.windowName;
		this.childWindows[newHandle] = {
			handle: newHandle,
			windowIdentifier: spawnResult.response.windowIdentifier,
		};

		if (options.autoShow === undefined || options.autoShow) {
			await spawnResult.response.finWindow.show();
		}

		return Promise.resolve(newHandle);
	}

	async close(handle: string): Promise<void> {
		const { wrap } = await this.finsemble.FinsembleWindow.getInstance({
			windowName: handle,
		});

		await wrap.close();

		delete this.childWindows[handle];
	}

	async reload(handle: string): Promise<void> {
		const { wrap } = await this.finsemble.FinsembleWindow.getInstance({
			windowName: handle,
		});

		return new Promise((resolve) => {
			wrap.reload({}, () => {
				resolve();
			});
		});
	}

	async setPosition(handle: string, position: { x: any; y: any; }): Promise<void> {
		const { wrap } = await this.finsemble.FinsembleWindow.getInstance({
			windowName: handle,
		});

		const { data } = await wrap.getBounds();

		await wrap.setBounds({
			bounds: {
				left: position.x,
				top: position.y,
				height: data?.height,
				width: data?.width,
			},
		});
	}

	async setSize(handle: string, size: Size): Promise<void> {
		const { wrap } = await this.finsemble.FinsembleWindow.getInstance({
			windowName: handle,
		});

		const { data } = await wrap.getBounds();

		await wrap.setBounds({
			bounds: {
				left: data?.left,
				top: data?.top,
				height: size.h,
				width: size.w,
			},
		});
	}

	async getBounds(handle: string): Promise<Rect> {
		const { wrap } = await this.finsemble.FinsembleWindow.getInstance({
			windowName: handle,
		});

		const { data } = await wrap.getBounds();

		return Promise.resolve({
			x: data!.left,
			y: data!.top,
			w: data!.width,
			h: data!.height,
		});
	}

	async setBounds(handle: string, bounds: Rect): Promise<void> {
		const { wrap } = await this.finsemble.FinsembleWindow.getInstance({
			windowName: handle,
		});

		await wrap.setBounds({
			bounds: {
				left: bounds.x,
				top: bounds.y,
				height: bounds.h,
				width: bounds.w,
			},
		});
	}

	async bringToFront(handle: string): Promise<void> {
		const { wrap } = await this.finsemble.FinsembleWindow.getInstance({
			windowName: handle,
		});

		await wrap.bringToFront();
	}

	async sendToBack(handle: string): Promise<void> {
		throw new Error("Method not implemented.");
	}

	async show(handle: string, options?: ShowOptions): Promise<void> {
		const { wrap } = await this.finsemble.FinsembleWindow.getInstance({
			windowName: handle,
		});

		// Fix: wrong showing position the first time after moving
		// the toolbar to a different monitor
		await this.setPosition(handle, options?.position ?? { x: 0, y: 0 });

		return new Promise((resolve) => {
			let optionsToUse: ShowOptions = {
				...{
					bringToFront: false,
					focus: false,
					position: undefined,
				},
				...options,
			};

			const cb = async () => {
				if (optionsToUse.bringToFront) {
					await wrap.bringToFront();
				}

				if (optionsToUse.focus) {
					await wrap.focus();
				}

				resolve();
			};
			if (optionsToUse.position) {
				wrap.showAt(
					{
						left: Math.floor(optionsToUse.position.x),
						top: Math.floor(optionsToUse.position.y),
					},
					cb
				);
			} else {
				wrap.show({}, cb);
			}
		});
	}

	async hide(handle: string): Promise<void> {
		const { wrap } = await this.finsemble.FinsembleWindow.getInstance({
			windowName: handle,
		});

		await wrap.hide();
	}

	async focus(handle: string): Promise<void> {
		this.finsemble.Clients.Logger.debug(`[MENU] Focus for ${handle}`);
		const { wrap } = await this.finsemble.FinsembleWindow.getInstance({
			windowName: handle,
		});

		await wrap.focus();
	}
}
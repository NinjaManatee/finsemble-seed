import React, { Component } from "react";
import "@finsemble/finsemble-core";
import { ChildWindowAPI } from "../common/ChildWindowAPI";

const initialPos = { x: -1000, y: -1000 };

export type TriggerRect = {
	position: { x: number; y: number };
	size: { w: number; h: number };
};

type UnSubscriber = () => void;

const childWindowAPI = new ChildWindowAPI(FSBL);

export class DropdownContainerAsync extends Component {
	private _openDropdownEndpointUnSubscriber: UnSubscriber | null = null;
	private _closeDropdownEndpointUnSubscriber: UnSubscriber | null = null;
	private _childWindowEventsHandlerUnSubscriber: UnSubscriber | null = null;
	private containerHandle = "dropdown-container-async";
	private readonly windowTitle: string = "DropdownAsync";

    constructor(props) {
        super(props);
        this.state = {
            isActive: false,
            justShowBefore: false,
            parentContainerPosition: {
                x: 0,
                y: 39
            }
        };
    }

	private hideWindow(shouldBlur: boolean = false) {
        this.setState({ isActive: false });
		childWindowAPI.setSize(this.containerHandle, {
			w: 1,
			h: 0,
		});

		if (shouldBlur) {
			childWindowAPI.blur(this.containerHandle);
		}

		document.title = "DropdownAsyncReady";
	}

	private readonly subscribeToChildWindowAPI = async () => {
        try {
            const { wrap } = await FSBL.FinsembleWindow.getInstance( { windowName: this.containerHandle} );
            const blurredUnsubscriber = wrap.addEventListener("blurred", () => {
                this.hideWindow();
            });
            const shownUnsubscriber = wrap.addEventListener("shown", async () => {
                this.setState({ isActive: true});
                FSBL.Clients.Logger.log(
                    `[UI-LIBRARY][DropdownContainerAsync][${this.containerHandle}]: resizing window on shown`
                );
                await this.resize();
                FSBL.Clients.Logger.log(
                    `[UI-LIBRARY][DropdownContainerAsync][${this.containerHandle}]: resized window on shown`
                );
            });
            const hiddenUnsubscriber = wrap.addEventListener("hidden", () => {

            });

            this._childWindowEventsHandlerUnSubscriber = () => {
                blurredUnsubscriber();
                shownUnsubscriber();
                hiddenUnsubscriber();
            }
		} catch (err: unknown) {
			const { message = "", stack = "" } = (err ?? {}) as Error;
			FSBL.Clients.Logger.error(
				`[UI-LIBRARY][DropdownContainerAsync][${this.containerHandle}]: subscribeToChildWindowAPI failed with error: ${message}, stack: ${stack}`
			);
		}
	};

	async getActualSize(): Promise<{
		position: { x: number; y: number };
		size: { w: number; h: number };
	}> {
		return {
			position: { x: 250, y: 250 },
			size: { w: 250, h: 250 },
		};
	}

	resize = async (totalWidth?: number) => {
		const { position: newPosition, size } = await this.getActualSize();
		const maxContainerWidth = totalWidth ?? size.w;
		const maxContainerHeight = size.h;

		await childWindowAPI.setSize(this.containerHandle, {
			w: Math.round(maxContainerWidth),
			h: Math.round(maxContainerHeight),
		});

		await childWindowAPI.setPosition(this.containerHandle, {
			y: Math.round(newPosition.y),
			x: Math.round(newPosition.x),
		});
	};

	private readonly createEndpoint = async () => {
        console.log("DEBUG: creating endpoint")
		try {
			// endpoint to open dropdown.
            FSBL.Clients.RouterClient.addResponder(`${DropdownContainerAsync.serviceName}-${DropdownContainerAsync.topic.open}`, async (err, queryMessage) => {
                const {
                    position,
                } = queryMessage?.data;
                FSBL.Clients.Logger.debug(
                    `[UI-LIBRARY][DropdownContainerAsync][${
                        this.containerHandle
                    }]: triggered open`
                );
                try {
                    await childWindowAPI.setSize(
                        this.containerHandle,
                        {
                            w: position.width,
                            h: 1,
                        }
                    );

                    await childWindowAPI.show(
                        this.containerHandle,
                        {
                            position: { x: position.x, y: position.y },
                            focus: true,
                            bringToFront: false,
                        }
                    );

                    FSBL.Clients.WindowClient.fitToDOM();
                    
                    document.title = `DropdownAsyncReady-open`;
                } catch (e: any) {
                    FSBL.Clients.Logger.error(
                        `[UI-LIBRARY][DropdownContainerAsync][${this.containerHandle}]: error happens when click on setting button, ${e.message}`
                    );
                }

                queryMessage?.sendQueryResponse(null);
            });
            this._openDropdownEndpointUnSubscriber = () => FSBL.Clients.RouterClient.removeResponder(`${DropdownContainerAsync.serviceName}-${DropdownContainerAsync.topic.open}`);
		} catch (err: unknown) {
			const { message = "", stack = "" } = (err ?? {}) as Error;
			FSBL.Clients.Logger.error(
				`[UI-LIBRARY][DropdownContainerAsync][${this.containerHandle}]: cannot create endpoint ${DropdownContainerAsync.serviceName}.${DropdownContainerAsync.topic.open}  error: ${message}, stack: ${stack}`
			);
			throw new Error(
				`[UI-LIBRARY][DropdownContainerAsync][${this.containerHandle}]: cannot create endpoint ${DropdownContainerAsync.serviceName}.${DropdownContainerAsync.topic.open}  error: ${message}, stack: ${stack}`
			);
		}

		try {
            // endpoint to close dropdown menu (e.g. when user click create new workspace button click handler opens single dialogue and close dropdown menu)
            FSBL.Clients.RouterClient.addResponder(`${DropdownContainerAsync.serviceName}-${DropdownContainerAsync.topic.close}`, async (err, queryMessage) => {
                FSBL.Clients.Logger.debug(
                    `[UI-LIBRARY][DropdownContainerAsync][${this.containerHandle}]: triggered close`
                );
                this.hideWindow(true);

                queryMessage?.sendQueryResponse(null);
            });
            this._closeDropdownEndpointUnSubscriber = () => FSBL.Clients.RouterClient.removeResponder(`${DropdownContainerAsync.serviceName}-${DropdownContainerAsync.topic.close}`);
		} catch (err: unknown) {
			const { message = "", stack = "" } = (err ?? {}) as Error;
			FSBL.Clients.Logger.error(
				`[UI-LIBRARY][DropdownContainerAsync][${this.containerHandle}]: cannot create endpoint ${DropdownContainerAsync.serviceName}.${DropdownContainerAsync.topic.close}  error: ${message}, stack: ${stack}`
			);
			throw new Error(
				`[UI-LIBRARY][DropdownContainerAsync][${this.containerHandle}]: cannot create endpoint ${DropdownContainerAsync.serviceName}.${DropdownContainerAsync.topic.close}  error: ${message}, stack: ${stack}`
			);
		}
	};

	componentWillLoad() {
        console.log("DEBUG: componentWillLoad");

        const FSBLReady = async ()=> {
            this.containerHandle = finsembleWindow.name;
            await Promise.all([
                this.subscribeToChildWindowAPI(),
                this.createEndpoint(),
            ]);
            this.hideWindow();
            document.title = "DropdownAsyncReady";
        };

        if (window.FSBL && FSBL.addEventListener) {
            FSBL.addEventListener("onReady", FSBLReady);
        } else {
            window.addEventListener("FSBLReady", FSBLReady);
        }
	}

	componentDidMount() {
        console.log("DEBUG: componentDidMount");
        this.componentWillLoad();
		document.title = this.windowTitle;
	}

	disconnectedCallback() {
		this._childWindowEventsHandlerUnSubscriber?.();
		this._closeDropdownEndpointUnSubscriber?.();
		this._openDropdownEndpointUnSubscriber?.();
	}

	render() {
		return (
			<div
				onClick={() => this.hideWindow(true)}
			>Click to close menu</div>
		);
	}
}

export namespace DropdownContainerAsync {
	export const serviceName = "ctx-menu";
	export enum topic {
		open = "open",
		close = "close",
		update = "update",
	}
}

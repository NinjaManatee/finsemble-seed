import "@finsemble/finsemble-core";
import React, { useEffect, useRef } from "react";
import { ChildWindowAPI } from "../common/ChildWindowAPI";

const dropdownWindowHandle = "dropdown-container-async";

export type TriggerRect = {
    position: { x: number; y: number };
    size: { w: number; h: number };
};

const childWindowAPI = new ChildWindowAPI(FSBL);

let unsubscriber: () => void;

export const DropdownContainerAsync = () => {
    const menuWrapper = useRef(null);

    const hideWindow = (shouldBlur: boolean = false) => {
        childWindowAPI.setSize(dropdownWindowHandle, {
            w: 0,
            h: 1,
        });

        // childWindowAPI.hide(dropdownWindowHandle);

        if (shouldBlur) {
            childWindowAPI.blur(dropdownWindowHandle);
        }

        document.title = "DropdownAsyncReady-hidden";
    }

    const subscribeToChildWindowAPI = async () => {
        const { wrap } = await FSBL.FinsembleWindow.getInstance({ windowName: dropdownWindowHandle });
        const shownUnsubscriber = wrap.addEventListener("shown", async () => {
            childWindowAPI.setBounds(dropdownWindowHandle, { x: 100, y: 100, h: 1000, w: 100});
            document.title = "DropdownAsyncReady-shown";
        });
        const blurredUnsubscriber = wrap.addEventListener("blurred", () => {
            hideWindow();
        });
        const hiddenUnsubsriber = wrap.addEventListener("hidden", () => { 
            // do nothing?
        });

        return () => {
            shownUnsubscriber();
            blurredUnsubscriber();
            hiddenUnsubsriber();
        };
    };

    useEffect(() => {
        (async () => {
            unsubscriber = await subscribeToChildWindowAPI();

            hideWindow();
            document.title = "DropdownAsyncReady-loaded";
        })();
        return () => unsubscriber?.();
    }, []);

    return (
        <div
            ref={menuWrapper}
            onClick={() => {
                hideWindow(true);
            }}
        >
            <h1>This is a menu with a whole lot of content.</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        </div>
    );
}
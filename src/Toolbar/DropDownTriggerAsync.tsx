import React, { useEffect, useRef, useState } from "react";
import "@finsemble/finsemble-core";
import { DropdownContainerAsync } from "../dropdown-app/DropdownContainerAsync";

const dropdownWindowHandle = "dropdown-container-async";

export const DropdownTriggerAsync = () => {
    const el = useRef<HTMLDivElement>(null);
    const [isActive, setIsActive] = useState(false);
    const [triggered, setTriggered] = useState(false);

    useEffect(() => {
        (async () => {
            const { wrap } = await FSBL.FinsembleWindow.getInstance({ windowName: dropdownWindowHandle });
            const shownUnsubscriber = wrap.addEventListener("shown", () => { setIsActive(true); });
            const blurredUnsubscriber = wrap.addEventListener("blurred", () => {
                setIsActive(false);
                setTriggered(false);
            });

            return () => {
                shownUnsubscriber();
                blurredUnsubscriber();
            };
        })();
    }, []);

    const handleOnClick = async (event: any): Promise<void> => {
        event.preventDefault();
        setTriggered(true);
        const triggerElementBounds = el.current!.getBoundingClientRect();
        const parentContainerBounds = { x: 0, y: 0, h: 39, w: 0 };
        const xPosition = Math.round(triggerElementBounds.x + parentContainerBounds.x);
        const yPosition = Math.round(parentContainerBounds.h + triggerElementBounds.y);
        const height = Math.round(triggerElementBounds.height);
        const width = Math.round(triggerElementBounds.width);

        await FSBL.Clients.RouterClient.query(`${DropdownContainerAsync.serviceName}-${DropdownContainerAsync.topic.open}`, {
            position: { x: xPosition, y: yPosition, width, height }
        });
    }

    return (
        <div 
            ref={el}
            onClick={handleOnClick}
            className={isActive && triggered ? 'lmn-dropdown-open disabled' : ''}>
            Open Dropdown
        </div>
    );
};
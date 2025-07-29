/*!
 * Copyright 2017 by ChartIQ, Inc.
 * All rights reserved.
 */

import * as React from "react";
import { createRoot } from "react-dom/client";
import {
	FinsembleProvider,
	FinsembleCSS,
	ToolbarIcon,
	Menu,
	Preferences,
	SystemLog,
	CentralLogger,
	Documentation,
	Restart,
	Reset,
	Quit,
	ToolbarShell,
	FavoritesShell,
	DragHandle,
	RevealAll,
	MinimizeAll,
	DownloadButton,
	NotificationControl,
	AutoArrange,
	AlwaysOnTop,
	Search,
	Dashbar,
	AdvancedAppLauncherMenu,
	AppLauncherMenu,
	WorkspaceManagementMenu,
	ToolbarSection,
	BloombergStatus,
} from "@finsemble/finsemble-core";
import { DropdownTriggerAsync } from "./DropDownTriggerAsync";

// In the below Menu's image/icon, Date.now is added as a query string on the icon url to ensure the page is not cached.
// The ToolbarIcon's src parameter and be either a URL path, or the name of a file in $documentRoot/assets/img.
export const FileMenu = () => (
	<Menu
		id="fileMenu"
		title={<ToolbarIcon className="finsemble-toolbar-brand-logo" src={"Finsemble_Toolbar_Icon.png"} />}
	>
		<Preferences />
		<CentralLogger />
		<Documentation />
		<Restart />
		<Quit />
		{/* To add your own items to the menu, import MenuItem from
		 * "@finsemble/finsemble-ui/react/components" and add the following:
		 * <MenuItem onClick={...}>Your Item</MenuItem>
		 */}
	</Menu>
);

/**
 * Note: Set `FSBL.debug = true` if you need to reload the toolbar during development.
 * By default, it prevents the system from closing it so that users aren't lost without
 * a main window into finsemble functionality.
 */
const Toolbar = () => (
	<ToolbarShell
		hotkeyShow={["ctrl", "alt", "t"]}
		hotkeyHide={["ctrl", "alt", "h"]}
		hotkeyDock={["ctrl", "shift", "alt", "t"]}
		hotkeyMinimizeAll={["ctrl", "alt", "down"]}
		hotkeyBringWindowsToFront={["ctrl", "alt", "up"]}
		hotkeyRestartApplication={["ctrl", "alt", "shift", "r"]}
	>
		<ToolbarSection className="left">
			<DragHandle />
			<FileMenu />
			<Search openHotkey={["ctrl", "alt", "f"]} />
			<WorkspaceManagementMenu />
			{/* Uncomment the following to enable the AdvancedAppLauncherMenu*/}
			{/* <AdvancedAppLauncherMenu /> */}
			<AppLauncherMenu />
			<DropdownTriggerAsync />
		</ToolbarSection>
		<ToolbarSection className="center" hideBelowWidth={115}>
			<div className="divider" />
			<FavoritesShell />
		</ToolbarSection>
		<BloombergStatus />
		<ToolbarSection className="right">
			<div className="divider"></div>
			<AlwaysOnTop />
			<AutoArrange />
			<MinimizeAll />
			<RevealAll />
			<DownloadButton />
			<NotificationControl />
		</ToolbarSection>
		<div className="resize-area"></div>
	</ToolbarShell>
);

const container = document.getElementsByTagName("div")[0];
createRoot(container).render(
	<FinsembleProvider>
		<FinsembleCSS />
		<Toolbar />
		<Dashbar />
	</FinsembleProvider>
);

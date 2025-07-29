import React from "react";
import { createRoot } from "react-dom/client";
import { DropdownContainerAsync } from "./DropdownContainerAsync";

const container = document.getElementsByTagName("div")[0];
createRoot(container).render(
	<DropdownContainerAsync/>
);
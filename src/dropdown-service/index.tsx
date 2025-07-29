import "@finsemble/finsemble-core";
import { ChildWindowAPI } from "../common/ChildWindowAPI";

const dropdownWindowHandle = "dropdown-container-async";

const childWindowAPI = new ChildWindowAPI(FSBL);

const main = async () => {
	await childWindowAPI.createWindow({
		componentId: "childWindowComponent",
		url: "http://localhost:3375/build/dropdown-app/index.html",
	});

	FSBL.Clients.RouterClient.addResponder("dropdown-service-open", (err, queryMessage) => {
		const { position } = queryMessage?.data

		childWindowAPI.show(dropdownWindowHandle, { position });
		queryMessage?.sendQueryResponse(null);
	});

	FSBL.Clients.RouterClient.addResponder("dropdown-service-close", (err, queryMessage) => {
		childWindowAPI.close(dropdownWindowHandle);
		queryMessage?.sendQueryResponse(null);
	});
};

main();
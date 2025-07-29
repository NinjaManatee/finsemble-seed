import "@finsemble/finsemble-core";
import { ChildWindowAPI } from "../common/ChildWindowAPI";

const childWindowAPI = new ChildWindowAPI(FSBL);

const main = async () => {
	await childWindowAPI.createWindow({
		componentId: "childWindowComponent",
		url: "http://localhost:3375/build/dropdown-app/index.html",
	});
};

main();
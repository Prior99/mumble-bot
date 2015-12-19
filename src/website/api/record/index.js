import Express from "express";

import ViewPlayCached from "./playcached";
import ViewSave from "./save";
import ViewPlay from "./play";
import ViewDownload from "./download";
import ViewDeleteCached from "./deletecached";
import ViewProtect from "./protect";
import ViewAddLabel from "./addlabel";
import ViewEdit from "./edit";
import ViewRandom from "./random";
import ViewList from "./list";
import ViewSaveDialog from "./save_dialog";
import ViewPlayDialog from "./play_dialog";
import ViewLookup from "./lookup";
import ViewGet from "./get";

/**
 * Router for all API callbacks related to /api/record/.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteRecords = function(bot) {
	const router = Express.Router();

	router.use("/save", ViewSave(bot));
	router.use("/play", ViewPlay(bot));
	router.use("/playcached", ViewPlayCached(bot));
	router.use("/download", ViewDownload(bot));
	router.use("/protect", ViewProtect(bot));
	router.use("/deletecached", ViewDeleteCached(bot));
	router.use("/addlabel", ViewAddLabel(bot));
	router.use("/edit", ViewEdit(bot));
	router.use("/random", ViewRandom(bot));
	router.use("/list", ViewList(bot));
	router.use("/lookup", ViewLookup(bot));
	router.use("/save_dialog", ViewSaveDialog(bot));
	router.use("/get", ViewGet(bot));
	router.use("/play_dialog", ViewPlayDialog(bot));

	return router;
};

export default RouteRecords;

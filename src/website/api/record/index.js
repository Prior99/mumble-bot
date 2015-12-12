/*
 * Imports
 */

import * as Express from "express";

/*
 * Views
 */

import * as viewPlayCached from "./playcached";
import * as viewSave from "./save";
import * as viewPlay from "./play";
import * as viewDownload from "./download";
import * as viewDeleteCached from "./deletecached";
import * as viewProtect from "./protect";
import * as viewAddLabel from "./addlabel";
import * as viewEdit from "./edit";
import * as viewRandom from "./random";
import * as viewList from "./list";
import * as viewSaveDialog from "./save_dialog";
import * as viewPlayDialog from "./play_dialog";
import * as viewLookup from "./lookup";
import * as viewGet from "./get";

/*
 * Code
 */

/**
 * Router for all API callbacks related to /api/record/.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteRecords = function(bot) {
	const router = Express.Router();

	router.use("/save", viewSave(bot));
	router.use("/play", viewPlay(bot));
	router.use("/playcached", viewPlayCached(bot));
	router.use("/download", viewDownload(bot));
	router.use("/protect", viewProtect(bot));
	router.use("/deletecached", viewDeleteCached(bot));
	router.use("/addlabel", viewAddLabel(bot));
	router.use("/edit", viewEdit(bot));
	router.use("/random", viewRandom(bot));
	router.use("/list", viewList(bot));
	router.use("/lookup", viewLookup(bot));
	router.use("/save_dialog", viewSaveDialog(bot));
	router.use("/get", viewGet(bot));
	router.use("/play_dialog", viewPlayDialog(bot));

	return router;
};

export default RouteRecords;

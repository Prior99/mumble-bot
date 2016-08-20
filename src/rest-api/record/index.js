import Express from "express";

import PlayCached from "./playcached";
import Save from "./save";
import Play from "./play";
import Download from "./download";
import DownloadCached from "./downloadcached";
import DeleteCached from "./deletecached";
import Protect from "./protect";
import AddLabel from "./addlabel";
import Edit from "./edit";
import Random from "./random";
import List from "./list";
import SaveDialog from "./save_dialog";
import PlayDialog from "./play_dialog";
import Lookup from "./lookup";
import Get from "./get";
import Visualized from "./visualized";
import VisualizedCached from "./visualizedcached";
import Fork from "./fork";

/**
 * Router for all API callbacks related to /api/record/.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteRecords = function(bot) {
	const router = Express.Router();

	router.use("/save", Save(bot));
	router.use("/play", Play(bot));
	router.use("/playcached", PlayCached(bot));
	router.use("/download", Download(bot));
	router.use("/downloadcached", DownloadCached(bot));
	router.use("/protect", Protect(bot));
	router.use("/deletecached", DeleteCached(bot));
	router.use("/addlabel", AddLabel(bot));
	router.use("/edit", Edit(bot));
	router.use("/random", Random(bot));
	router.use("/list", List(bot));
	router.use("/lookup", Lookup(bot));
	router.use("/save_dialog", SaveDialog(bot));
	router.use("/get", Get(bot));
	router.use("/play_dialog", PlayDialog(bot));
	router.use("/visualized", Visualized(bot));
	router.use("/visualizedcached", VisualizedCached(bot));
	router.use("/fork", Fork(bot));

	return router;
};

export default RouteRecords;

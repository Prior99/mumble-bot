import * as Winston from "winston";
import * as Promise from "promise";

/**
 * <b>/record/cached/</b> Handler for the WEBSOCKET handler for this endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - Websocket handler for this page.
 */
const WebsocketOverview = function(bot) {
	return function(ws, req) {
		const onAdd = function(audio) {
			ws.send(JSON.stringify({
				type : "add",
				audio
			}));
		};
		const onRemoveAudio = function(audio) {
			ws.send(JSON.stringify({
				type : "remove",
				id : audio.id
			}));
		};
		const onProtect = function(audio) {
			ws.send(JSON.stringify({
				type : "protect",
				id : audio.id
			}));
		};
		ws.send(JSON.stringify({
			type : "init",
			cacheAmount : bot.audioCacheAmount,
			list : bot.cachedAudios
		}));
		bot.on("cached-audio", onAdd);
		bot.on("removed-cached-audio", onRemoveAudio);
		bot.on("protect-cached-audio", onProtect);
		ws.on("close", () => {
			bot.removeListener("cached-audio", onAdd);
			bot.removeListener("removed-cached-audio", onRemoveAudio);
			bot.removeListener("protect-cached-audio", onProtect);
		});
	}
};

export default WebsocketOverview;

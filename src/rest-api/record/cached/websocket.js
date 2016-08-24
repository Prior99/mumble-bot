import * as Winston from "winston";

/**
 * <b>/record/cached/</b> Handler for the WEBSOCKET handler for this endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - Websocket handler for this page.
 */
const WebSocketOverview = function(bot) {
	return function(ws, req) {
		const onAdd = audio => {
			ws.send(JSON.stringify({
				type: "add",
				audio
			}));
		};
		const onRemoveAudio = audio => {
			ws.send(JSON.stringify({
				type: "remove",
				id: audio.id
			}));
		};
		const onProtect = audio => {
			ws.send(JSON.stringify({
				type: "protect",
				id: audio.id
			}));
		};
		ws.send(JSON.stringify({
			type: "init",
			cacheAmount: bot.audioCacheAmount,
			list: bot.cachedAudios
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

export default WebSocketOverview;
	


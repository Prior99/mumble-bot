import * as Winston from "winston";
import { ApiWsEndpoint } from "../../types";
import { Bot } from "../../..";

/**
 * Api endpoint for the WEBSOCKET handler for this endpoint.
 */
export const Websocket: ApiWsEndpoint = (bot: Bot) => (ws, req) => {
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
};

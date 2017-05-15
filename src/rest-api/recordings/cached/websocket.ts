import * as Winston from "winston";
import { AuthorizedApiWsEndpoint } from "../../types";
import { Bot } from "../../..";
import { omit } from "ramda";

/**
 * Api endpoint for the WEBSOCKET handler for this endpoint.
 */
export const Websocket: AuthorizedApiWsEndpoint = (bot: Bot) => (ws, req) => {
    const onAdd = audio => {
        ws.send(JSON.stringify({
            type: "add",
            recording: omit(["file"], audio)
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
        list: bot.cachedAudios.map(recording => omit(["file"], recording))
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

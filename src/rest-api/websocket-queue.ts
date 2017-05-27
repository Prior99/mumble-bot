import * as Winston from "winston";
import { ApiWsEndpoint } from "./types/index";
import { Bot } from "../index";
import { WorkItem } from "../types";

function convertWorkItem(item: WorkItem) {
    const { meta, time } = item;
    const { user } = meta;
    if (meta.type === "recording") {
        const { recording } = meta;
        return {
            time,
            user: user.id,
            recording: recording.id,
            type: meta.type
        };
    }
    if (meta.type === "sound") {
        const { sound } = meta;
        return {
            time,
            user: user.id,
            sound: sound.id,
            type: meta.type
        };
    }
    if (meta.type === "cached") {
        const { cachedRecording } = meta;
        return {
            time,
            user: user.id,
            cachedRecording: cachedRecording.id,
            type: meta.type
        };
    }
    if (meta.type === "dialog") {
        return {
            time,
            user: user.id,
            type: meta.type
        };
    }
}

/**
 * Handler for the WEBSOCKET at this endpoint.
 */
export const WebsocketQueue: ApiWsEndpoint = (bot: Bot) => (ws, req) => {
    try {
        ws.send(JSON.stringify({
            type: "init",
            queue: bot.output.queue.map(convertWorkItem)
        }));
    }
    catch (err) {
        Winston.error("Error sending initial packet to live queue websocket:", err);
    }
    const onEnqueue = (workitem) => {
        ws.send(JSON.stringify({
            type: "enqueue",
            workitem: convertWorkItem(workitem)
        }));
    };
    const onDequeue = () => {
        ws.send(JSON.stringify({
            type: "dequeue"
        }));
    };
    const onClear = () => {
        ws.send(JSON.stringify({
            type: "clear"
        }));
    };
    bot.output.on("clear", onClear);
    bot.output.on("enqueue", onEnqueue);
    bot.output.on("dequeue", onDequeue);
    ws.on("close", () => {
        bot.output.removeListener("clear", onClear);
        bot.output.removeListener("enqueue", onEnqueue);
        bot.output.removeListener("dequeue", onDequeue);
    });
};

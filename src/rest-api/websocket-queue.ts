import * as Winston from "winston";
import { ApiWsEndpoint } from "./types/index";
import { Bot } from "../index";

/**
 * Handler for the WEBSOCKET at this endpoint.
 */
export const WebsocketQueue: ApiWsEndpoint = (bot: Bot) => (ws, req) => {
    try {
        ws.send(JSON.stringify({
            action: "initial",
            data: bot.output.queue
        }));
    }
    catch (err) {
        Winston.error("Error sending initial packet to live queue websocket:", err);
    }
    const onEnqueue = (workitem) => {
        ws.send(JSON.stringify({
            action: "enqueue",
            data: workitem
        }));
    };
    const onDequeue = () => {
        ws.send(JSON.stringify({
            action: "dequeue"
        }));
    };
    const onClear = () => {
        ws.send(JSON.stringify({
            action: "clear"
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

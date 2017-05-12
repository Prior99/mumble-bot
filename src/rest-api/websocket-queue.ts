import * as Winston from "winston";

/**
 * <b>/queue/</b> Handler for the WEBSOCKET handler for this endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - Websocket handler for this page.
 */
export const WebsocketQueue = (bot) => (ws, req) => {
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

import * as Winston from "winston";

/**
 * Returns the timestamp formatted as yyyy-mm-dd hh:mm:ss
 * @return The formatted timestamp.
 */
function timestampFunction () {
    const d = new Date();
    const actualYear = d.getFullYear();
    return new Date().toISOString();
}

export function setupWinston() {
    Winston.remove(Winston.transports.Console);
    Winston.add(Winston.transports.Console, {
        colorize: true,
        timestamp: timestampFunction,
        level: "verbose",
    });
}

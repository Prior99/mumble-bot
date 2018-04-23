import * as Winston from "winston";
import * as moment from "moment";

/**
 * Returns the timestamp formatted as yyyy-mm-dd hh:mm:ss
 * @return The formatted timestamp.
 */
function timestampFunction () {
    const d = new Date();
    const actualYear = d.getFullYear();
    return moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
}

export function setupWinston() {
    Winston.remove(Winston.transports.Console);
    Winston.add(Winston.transports.Console, {
        colorize: true,
        timestamp: timestampFunction,
        level: "verbose",
    });
}

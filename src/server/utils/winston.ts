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

export function setupWinston(filename: string) {
    Winston.remove(Winston.transports.Console);
    Winston.add(Winston.transports.Console, {
        colorize: true,
        timestamp: timestampFunction,
        level: "verbose",
    });

    Winston.add(Winston.transports.File, {
        filename,
        maxsize: "64000",
        maxFiles: 7,
        json: false,
        level: "verbose",
        colorize: true,
        timestamp: timestampFunction,
    });
}

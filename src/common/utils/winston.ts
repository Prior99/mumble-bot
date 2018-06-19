import * as Winston from "winston";

export function setupWinston() {
    Winston.remove(Winston.transports.Console);
    Winston.add(new Winston.transports.Console({
        format: Winston.format.combine(
            Winston.format.timestamp({ format: "YYYY-MM-DDTHH:mm:ss" }),
            Winston.format.colorize(),
            Winston.format.printf(info => `${info.timestamp} - ${info.level}: ${info.message}`),
        ),
        level: "verbose",
    }));
}

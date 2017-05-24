export type LogLevel = "error" | "warning" | "verbose" | "info" | "debug";
/**
 * One entry in the bots log.
 */

export interface LogEntry {
    /**
     * Loglevel (Consult winston for this.) error, warning, verbose, info, etc...
     */
    level: LogLevel;
    /**
     * The message that was logged.
     */
    message: string;
    /**
     * The date and time this was logged.
     */
    timestamp: Date;
}

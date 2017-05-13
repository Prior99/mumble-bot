import { LogEntry } from "../types/log";

/**
 * List the last 500 entries of the servers log.
 * @return Last 500 log entries.
 */
export async function listLog(connection): Promise<LogEntry[]> {
    const rows = await connection.query(
        "SELECT level, message, `timestamp` FROM Log ORDER BY `timestamp` DESC LIMIT 500"
    );
    return rows;
}

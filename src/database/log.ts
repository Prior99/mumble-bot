/**
 * One entry in the bots log.
 * @typedef LogEntry
 * @property {string} level - Loglevel (Consult winston for this.) error, warning, verbose, info, etc...
 * @property {string} message - The message that was logged.
 * @property {date} timestamp - The date and time this was logged.
 */
/**
 * <b>Async</b> List the last 500 entries of the servers log.
 * @return {LogEntry[]} - Last 500 log entries.
 */
export async function listLog(connection) {
    const rows = await connection.query(
        "SELECT level, message, `timestamp` FROM Log ORDER BY `timestamp` DESC LIMIT 500"
    );
    return rows;
}

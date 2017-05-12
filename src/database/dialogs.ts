import * as Winston from "winston";
import { getRecord } from ".";

/**
 * <b>Async</b> Create a new dialog in the database.
 * @param {number[]} dialog - Array of ids of the records in the dialog.
 * @return {undefined}l
 */
export async function addDialog(dialog, connection) {
    const result = await connection.query("INSERT INTO Dialogs(submitted) VALUES(?)", [new Date()]);
    const dialogId = result.insertId;
    await Promise.all(dialog.map((id, index) => connection.query(
        "INSERT INTO DialogParts(dialogId, position, recordId) VALUES(?, ?, ?)",
        [dialogId, index, id]
    )
    ));
};

/**
 * <b>Async</b> Get the parts of a dialog (The single records).
 * @param {number} dialogId - Id of the dialog to fetch the parts from.
 * @return {number[]} - List of all ids of the records in the dialog in the correct order.
 */
export async function getDialogParts(dialogId, connection) {
    const list = await connection.query(
        "SELECT recordId FROM DialogParts WHERE dialogId = ? ORDER BY position ASC",
        [dialogId]
    );
    return list.map(p => p.recordId);
};

/**
 * <b>Async</b> Get the single records from a dialog based on its id.
 * @param {number} dialogId - The id of the dialog to get the records from.
 * @return {Record[]} - List of all records belonging to this dialog.
 */
export async function getDialogRecords(dialogId, connection) {
    const ids = await getDialogParts(dialogId, connection);
    const records = await Promise.all(ids.map(id => getRecord(id, connection)));
    return records;
}
/**
 * A dialog as represented in the database including all its records.
 * @typedef Dialog
 * @property {number} id - Unique id of this dialog.
 * @property {date} submitted - The date when this dialog was submitted.
 * @property {number} used - How often this dialog was used.
 * @property {Record[]} records - All records belonging to this dialog.
 */
/**
 * <b>Async</b> Grab a whole dialog by id, including all records belonging to this dialog.
 * @param {number} id - Id of the dialog to fetch.
 * @return {Dialog} - The dialog which was fetched.
 */
export async function getDialog(id, connection) {
    let dialog;
    const results = await connection.query("SELECT id, submitted, used FROM Dialogs WHERE id = ?", [id]);
    if (!results.length) {
        return null;
    }
    else {
        dialog = results[0];
        const parts = await getDialogRecords(dialog.id, connection);
        dialog.records = parts;
        return dialog;
    }
}
/**
 * List all dialogs existing in the database.
 * @return {Dialog[]} - List of all dialogs in the database.
 */
export async function listDialogs(connection) {
    const dialogs = await connection.query("SELECT id FROM Dialogs ORDER BY used DESC");
    const completedDialogs = await Promise.all(
        dialogs.map(dialog => getDialog(dialog.id, connection))
    );
    return completedDialogs;
}

/**
 * Update a dialog to be used. (Increment the usages by one)
 * @param {number} id - Id of the dialog which was used.
 * @return {undefined}
 */
export async function usedDialog(id, connection) {
    await connection.query("UPDATE Dialogs SET used = used +1 WHERE id = ?", [id]);
}

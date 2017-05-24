import * as Winston from "winston";
import { getRecording } from ".";
import { Dialog, Recording } from "../types";

/**
 * Create a new dialog in the database.
 * @param dialog Array of ids of the records in the dialog.
 */
export async function addDialog(dialog: number[], connection): Promise<void> {
    const result = await connection.query("INSERT INTO Dialogs(submitted) VALUES(?)", [new Date()]);
    const dialogId = result.insertId;
    await Promise.all(dialog.map((id, index) => connection.query(
            "INSERT INTO DialogParts(dialogId, position, recordId) VALUES(?, ?, ?)", [dialogId, index, id]
        )
    ));
}

/**
 * Get the parts of a dialog (The single records).
 * @param dialogId Id of the dialog to fetch the parts from.
 * @return List of all ids of the records in the dialog in the correct order.
 */
export async function getDialogParts(dialogId: number, connection): Promise<number[]> {
    const list = await connection.query(
        "SELECT recordId FROM DialogParts WHERE dialogId = ? ORDER BY position ASC", [dialogId]
    );
    return list.map(p => p.recordId);
}

/**
 * Get the single records from a dialog based on its id.
 * @param dialogId The id of the dialog to get the records from.
 * @return List of all records belonging to this dialog.
 */
export async function getDialogRecordings(dialogId: number, connection): Promise<Recording[]> {
    const ids = await getDialogParts(dialogId, connection);
    return await Promise.all(ids.map(id => getRecording(id, connection)));
}

/**
 * Grab a whole dialog by id, including all records belonging to this dialog.
 * @param id Id of the dialog to fetch.
 * @return The dialog which was fetched.
 */
export async function getDialog(id: number, connection): Promise<Dialog> {
    const results = await connection.query("SELECT id, submitted, used FROM Dialogs WHERE id = ?", [id]);
    if (!results.length) {
        return;
    }
    else {
        const dialog = results[0];
        return {
            ...dialog,
            recordings: await getDialogParts(dialog.id, connection)
        };
    }
}

/**
 * List all dialogs existing in the database.
 * @return List of all dialogs in the database.
 */
export async function listDialogs(connection): Promise<Dialog[]> {
    const results = await connection.query("SELECT id FROM Dialogs ORDER BY used DESC");
    const dialogs: Promise<Dialog>[] = results.map(result => getDialog(result.id, connection));
    return await Promise.all(dialogs);
}

/**
 * Update a dialog to be used. (Increment the usages by one)
 * @param id Id of the dialog which was used.
 */
export async function usedDialog(id: number, connection): Promise<void> {
    await connection.query("UPDATE Dialogs SET used = used +1 WHERE id = ?", [id]);
}

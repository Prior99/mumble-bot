import Winston from "winston";
/**
 * Extends the database with methods for dialogs.
 * @param {Database} Database - The Database class to extend.
 * @return {undefined}
 */
const DialogsExtension = function(Database) {
    /**
     * <b>Async</b> Create a new dialog in the database.
     * @param {number[]} dialog - Array of ids of the records in the dialog.
     * @return {undefined}l
     */
    Database.prototype.addDialog = async function(dialog) {
        const result = await this.connection.query("INSERT INTO Dialogs(submitted) VALUES(?)", [new Date()]);
        const dialogId = result.insertId;
        await Promise.all(dialog.map((id, index) => this.connection.query(
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
    Database.prototype.getDialogParts = async function(dialogId) {
        const list = await this.connection.query(
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
    Database.prototype.getDialogRecords = async function(dialogId) {
        const ids = await this.getDialogParts(dialogId);
        const records = await Promise.all(ids.map(id => this.getRecord(id)));
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
    Database.prototype.getDialog = async function(id) {
        let dialog;
        const results = await this.connection.query("SELECT id, submitted, used FROM Dialogs WHERE id = ?", [id]);
        if(!results.length) {
            return null;
        }
        else {
            dialog = results[0];
            const parts = await this.getDialogRecords(dialog.id);
            dialog.records = parts;
            return dialog;
        }
    }
    /**
     * List all dialogs existing in the database.
     * @param {any} ignored - This parameter only exists in order to avoid babel error T6744.
     * @return {Dialog[]} - List of all dialogs in the database.
     */
    Database.prototype.listDialogs = async function(ignored) {
        const dialogs = await this.connection.query("SELECT id FROM Dialogs ORDER BY used DESC");
        const completedDialogs = await Promise.all(
            dialogs.map(dialog => this.getDialog(dialog.id))
        );
        return completedDialogs;
    }

    /**
     * Update a dialog to be used. (Increment the usages by one)
     * @param {number} id - Id of the dialog which was used.
     * @return {undefined}
     */
    Database.prototype.usedDialog = async function(id) {
        await this.connection.query("UPDATE Dialogs SET used = used +1 WHERE id = ?", [id]);
    }
};
export default DialogsExtension;

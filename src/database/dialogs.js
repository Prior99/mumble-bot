import Winston from "winston";
import Promise from "promise";

class Database {
	addDialog(dialog, callback) {
		Promise.denodeify(this.pool.query.bind(this.pool))("INSERT INTO Dialogs(submitted) VALUES(?)", [new Date()])
		.catch(callback)
		.then(result => {
			const dialogId = result.insertId;
			return Promise.all(dialog.map((id, index) => {
				return Promise.denodeify(this.pool.query.bind(this.pool))(
					"INSERT INTO DialogParts(dialogId, position, recordId) VALUES(?, ?, ?)",
					[dialogId, index, id]);
			}));
		})
		.catch(callback)
		.then(() => { callback(null) });
	}

	getDialogParts(dialogId, callback) {
		Promise.denodeify(this.pool.query.bind(this.pool))(
			"SELECT recordId FROM DialogParts WHERE dialogId = ? ORDER BY position ASC", [dialogId])
		.catch(callback)
		.then(list => {
			callback(null, list.map(p => p.recordId))
		});
	}

	getDialogRecords(dialogId, callback) {
		Promise.denodeify(this.getDialogParts)(dialogId)
		.catch(callback)
		.then(ids => {
			return Promise.all(ids.map(id => {
				return Promise.denodeify(this.getRecord.bind(this))(id);
			}))
		})
		.catch(callback)
		.then(records => {
			callback(null, records);
		});
	}

	getDialog(id, callback) {
		let dialog;
		Promise.denodeify(this.pool.query.bind(this.pool))("SELECT id, submitted, used FROM Dialogs WHERE id = ?", [id])
		.catch(callback)
		.then(results => {
			if(!results.length) {
				callback(null, null);
			}
			else {
				dialog = results[0];
				return Promise.denodeify(this.getDialogRecords.bind(this))(dialog.id);
			}
		})
		.catch(callback)
		.then(parts => {
			dialog.records = parts;
			callback(null, dialog);
		});
	}

	listDialogs(callback) {
		Promise.denodeify(this.pool.query.bind(this.pool))("SELECT id FROM Dialogs ORDER BY used DESC")
		.catch(callback)
		.then(dialogs => {
			return Promise.all(dialogs.map(dialog => {
				return Promise.denodeify(this.getDialog.bind(this))(dialog.id);
			}));
		})
		.catch(callback)
		.then(dialogs => {
			callback(null, dialogs);
		});
	}

	usedDialog(id, callback) {
		Promise.denodeify(this.pool.query.bind(this.pool))("UPDATE Dialogs SET used = used +1 WHERE id = ?", [id])
		.catch(callback)
		.then(() => {
			callback(null);
		});
	}
}

module.exports = Database; TODO

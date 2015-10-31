var Winston = require('winston');
var Promise = require('promise');

module.exports = function(Database) {

	Database.prototype.addDialog = function(dialog, callback) {
		Promise.denodeify(this.pool.query.bind(this.pool))("INSERT INTO Dialogs(submitted) VALUES(?)", [new Date()])
		.catch(callback)
		.then(function(result) {
			var dialogId = result.insertId;
			return Promise.all(dialog.map(function(id, index) {
				return Promise.denodeify(this.pool.query.bind(this.pool))("INSERT INTO DialogParts(dialogId, position, recordId) VALUES(?, ?, ?)", [dialogId, index, id]);
			}.bind(this)));
		}.bind(this))
		.catch(callback)
		.then(function() {
			callback(null);
		}.bind(this));
	};

	Database.prototype.getDialogParts = function(dialogId, callback) {
		Promise.denodeify(this.pool.query.bind(this.pool))("SELECT recordId FROM DialogParts WHERE dialogId = ? ORDER BY position ASC", [dialogId])
		.catch(callback)
		.then(function(list) {
			callback(null, list.map(function(p) {
				return p.recordId;
			}.bind(this)));
		}.bind(this));
	};

	Database.prototype.getDialogRecords = function(dialogId, callback) {
		Promise.denodeify(this.getDialogParts.bind(this))(dialogId)
		.catch(callback)
		.then(function(ids) {
			return Promise.all(ids.map(function(id) {
				return Promise.denodeify(this.getRecord.bind(this))(id);
			}.bind(this)))
		}.bind(this))
		.catch(callback)
		.then(function(records) {
			callback(null, records);
		}.bind(this));
	};

	Database.prototype.getDialog = function(id, callback) {
		var dialog;
		Promise.denodeify(this.pool.query.bind(this.pool))("SELECT id, submitted, used FROM Dialogs WHERE id = ?", [id])
		.catch(callback)
		.then(function(results) {
			if(!results.length) {
				callback(null, null);
			}
			else {
				dialog = results[0];
				return Promise.denodeify(this.getDialogRecords.bind(this))(dialog.id);
			}
		}.bind(this))
		.catch(callback)
		.then(function(parts) {
			dialog.records = parts;
			callback(null, dialog);
		}.bind(this));
	};

	Database.prototype.listDialogs = function(callback) {
		Promise.denodeify(this.pool.query.bind(this.pool))("SELECT id FROM Dialogs ORDER BY used DESC")
		.catch(callback)
		.then(function(dialogs) {
			return Promise.all(dialogs.map(function(dialog) {
				return Promise.denodeify(this.getDialog.bind(this))(dialog.id);
			}.bind(this)));
		}.bind(this))
		.catch(callback)
		.then(function(dialogs) {
			callback(null, dialogs);
		});
	};

	Database.prototype.usedDialog = function(id, callback) {
		Promise.denodeify(this.pool.query.bind(this.pool))("UPDATE Dialogs SET used = used +1 WHERE id = ?", [id])
		.catch(callback)
		.then(function() {
			callback(null);
		}.bind(this));
	};
};

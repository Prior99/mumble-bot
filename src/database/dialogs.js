var Winston = require('winston');

module.exports = function(Database) {

	Database.prototype.addDialog = function(quote, date, dialog, callback) {
		var dialogLen = dialog.length;
		
		function callfront(err, result) {
			var dialogId = result.insertId;
			var pos = 0;
			
			var insertNext = function() {
				if(pos < dialogLen) {
					var part = dialog[pos];
					
					var insPart = "INSERT INTO DialogParts(dialogId, position, recordId) VALUES(?, ?, ?)";
					this.queryAndCheck(insPart,	[dialogId, pos, part], callback, function(err, res) {
							pos++;
							insertNext();
					}.bind(this));
				} else if(callback) {
					callback(null, result.insertId);
				}
			}.bind(this);
			
			insertNext();
		}
		
		var insQuery = "INSERT INTO Dialogs(quote, submitted) VALUES(?, ?)";
		this.queryAndCheck(insQuery, [quote, date], callback, callfront.bind(this));
	}; // end methoddef
	
	Database.prototype.getDialogParts = function(dialogId, c1, c2) {
		var query = "SELECT recordId FROM DialogParts WHERE dialogId = ? ORDER BY position ASC";
		this.queryAndCheck(query, [dialogId], c1, c2);
	};
	
	Database.prototype.listDialogs = function(c1, c2) {
		var query = "SELECT id, quote, submitted, used FROM Dialogs ORDER BY used DESC";
		this.queryAndCheck(query,	[],	c1, c2);
	};
	
	Database.prototype.usedDialog = function(id, c1, c2) {
		this.queryAndCheck("UPDATE Dialogs SET used = used +1 WHERE id = ?", [id],	c1, c2);
	};
};

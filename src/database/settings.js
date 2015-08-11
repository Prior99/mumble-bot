module.exports = function(Database) {
	Database.prototype.getSetting = function(user, setting, callback) {
		this.pool.query("SELECT value FROM UserSettings WHERE user = ? AND setting = ?", [user.id, setting], function(err, rows) {
			if(this._checkError(err, callback)) {
				if(rows.length > 0) {
					if(callback) { callback(null, rows[0].value); }
				}
				else {
					if(callback) { callback(null, null); }
				}
			}
		}.bind(this));
	};

	Database.prototype.getSettings = function(user, callback) {
		this.pool.query("SELECT setting, value FROM UserSettings WHERE user = ?", [user.id], function(err, rows) {
			if(this._checkError(err, callback)) {
				var settings = {};
				rows.forEach(function(row) {
					settings[row.setting] = row.value;
				});
				if(callback) { callback(null, settings); }
			}
		}.bind(this));
	};

	Database.prototype.setSetting = function(user, setting, value, callback) {
		this.pool.query("INSERT INTO UserSettings(user, setting, value) VALUES(?, ?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)", [user.id, setting, value], function(err) {
			this._checkError(err, callback);
		}.bind(this));
	};
};

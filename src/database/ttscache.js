module.exports = function(Database) {

	Database.prototype.getCachedTTS = function(text, callback) {
		this.pool.query("SELECT id AS filename FROM TTSCache WHERE text LIKE ?", [text.toLowerCase()],
			function(err, rows) {
				if(err) {
					if(callback) { callback(err); }
					else throw err;
				}
				else {
					if(callback) {
						if(rows.length >= 1) {
							callback(null, rows[0].filename);
						}
						else {
							callback(null, null);
						}
					}
				}
			}
		);
	};

	Database.prototype.addCachedTTS = function(text, callback) {
		this.pool.query("INSERT INTO TTSCache(text) VALUES(?)", [text.toLowerCase()],
			function(err, result) {
				if(err) {
					if(callback) { callback(err); }
					else throw err;
				}
				else {
					if(callback) { callback(null, result.insertId); }
				}
			}
		);
	};	
};

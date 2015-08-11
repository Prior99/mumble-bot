module.exports = function(Database) {
	Database.prototype.addRecord = function(quote, user, date, callback) {
		this.pool.query("INSERT INTO Records(quote, user, submitted) VALUES(?, ?, ?)",
			[quote, user.id, date], function(err, result) {
				if(this._checkError(err, callback)) {
					if(callback) { callback(null, result.insertId); }
				}
			}.bind(this)
		);
	};
	Database.prototype.listRecords = function(callback) {
		this.pool.query("SELECT id, quote, used, user, submitted FROM Records ORDER BY used DESC",
			function(err, rows) {
				if(this._checkError(err, callback)) { //Check error for this query
					var finished = []; //This array will be filled with all sounds already having user
					var next = function() { //Called recursively
						if(rows.length > 0) { //Only do this if rows are left to process
							var row = rows.pop(); //Take next row
							this.getUserById(row.user, function(err, user) { //Fetch user
								if(this._checkError(err, callback)) {
									row.user = user; //Save user in row
									finished.push(row);
									next(); //Continue recursion
								}
							}.bind(this));
						}
						else {
							if(callback) { callback(null, finished); } // All rows done
						}
					}.bind(this);
					next();
				}
			}.bind(this)
		);
	};
	Database.prototype.usedRecord = function(id, callback) {
		this.pool.query("UPDATE Records SET used = used +1",
			[id], function(err) {
				if(this._checkError(err, callback)) {
					if(callback) { callback(null); }
				}
			}.bind(this)
		);
	};
};

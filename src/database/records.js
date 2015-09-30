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
	Database.prototype.listRecordsForUser = function(user, callback) {
		this.pool.query("SELECT id, quote, used, submitted FROM Records WHERE user = ? ORDER BY used DESC", [user.id],
			function(err, rows) {
				if(this._checkError(err, callback)) {
					if(callback) { callback(null, rows); }
				}
			}.bind(this)
		);
	};
	Database.prototype.usedRecord = function(id, callback) {
		this.pool.query("UPDATE Records SET used = used +1 WHERE id = ?",
			[id], function(err) {
				if(this._checkError(err, callback)) {
					if(callback) { callback(null); }
				}
			}.bind(this)
		);
	};
	Database.prototype.getRecord = function(id, callback) {
		this.pool.query("SELECT id, quote, used, user, submitted FROM Records WHERE id = ?",
			[id], function(err, rows) {
				if(this._checkError(err, callback)) {
					if(callback) { callback(null, rows[0]); }
				}
			}.bind(this)
		);
	};
	Database.prototype.addRecordLabel = function(name, callback) {
		this.pool.query("INSERT INTO RecordLabels(name) VALUES(?)", [name], function(err, result) {
			if(this._checkError(err, callback)) {
				if(callback) { callback(null, result.insertId); }
			}
		}.bind(this));
	};
	Database.prototype.listLabels = function(callback) {
		this.pool.query("SELECT name, id, COUNT(record) AS records FROM RecordLabels LEFT JOIN RecordLabelRelation ON id = label GROUP BY id", function(err, rows) {
			if(this._checkError(err, callback)) {
				callback(null, rows);
			}
		}.bind(this));
	};
	Database.prototype.addRecordToLabel = function(record, label, callback) {
		this.pool.query("INSERT INTO RecordLabelRelation(record, label) VALUES(?, ?)", [record, label], function(err, result) {
			if(this._checkError(err, callback)) {
				if(callback) { callback(null); }
			}
		}.bind(this));
	};
	Database.prototype.listRecordsByLabel = function(label, callback) {
		this.pool.query("SELECT id, quote, used, user, submitted FROM RecordLabelRelation LEFT JOIN RecordLabelRelation ON id = record WHERE label = ? ORDER BY used DESC", [label], function(err, rows) {
			if(this._checkError(err, callback)) {
				callback(null, rows);
			}
		}.bind(this));
	};
};

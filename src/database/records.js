var Promise = require('promise');

module.exports = function(Database) {
	Database.prototype.addRecord = function(quote, user, date, labels, callback) {
		this.pool.query("INSERT INTO Records(quote, user, submitted) VALUES(?, ?, ?)",
			[quote, user.id, date], function(err, result) {
				if(this._checkError(err, callback)) {
					labels.forEach(function(label) {
						this.addRecordToLabel(result.insertId, label);
					}.bind(this));
					if(callback) { callback(null, result.insertId); }
				}
			}.bind(this)
		);
	};
	Database.prototype._completeRecords = function(records, callback) {
		var promises = records.map(function(record) {
			return Promise.denodeify(this.getRecord.bind(this))(record.id);
		}.bind(this));
		Promise.all(promises)
		.catch(callback)
		.then(function(records) {
			callback(null, records);
		});
	};
	Database.prototype.updateRecord = function(id, quote, labels, callback) {
		new Promise(function(okay, fail) {
			this.pool.query("UPDATE Records SET quote = ? WHERE id = ?", [quote, id], function(err, rows) {
				if(err) {
					fail(err);
				}
				else {
					okay(rows);
				}
			});
		}.bind(this))
		.catch(callback)
		.then(function() {
			return new Promise(function(okay, fail) {
				this.pool.query("DELETE FROM RecordLabelRelation WHERE record = ?", [id], function(err) {
					if(err) {
						fail(err);
					}
					else {
						okay();
					}
				});
			}.bind(this));
		}.bind(this))
		.catch(callback)
		.then(function() {
			labels.forEach(function(label) {
				this.addRecordToLabel(id, label);
			}.bind(this));
			callback();
		}.bind(this));
	};
	Database.prototype.listRecords = function(callback) {
		new Promise(function(okay, fail) {
			this.pool.query("SELECT id FROM Records ORDER BY used DESC", function(err, rows) {
					if(err) {
						fail(err);
					}
					else {
						okay(rows);
					}
				}
			);
		}.bind(this))
		.catch(callback)
		.then(function(records) {
			return Promise.denodeify(this._completeRecords.bind(this))(records);
		}.bind(this))
		.catch(callback)
		.then(function(records) {
			callback(null, records);
		});
	};
	Database.prototype.listRecordsForUser = function(user, callback) {
		new Promise(function(okay, fail) {
			this.pool.query("SELECT id FROM Records WHERE user = ? ORDER BY used DESC", [user.id], function(err, rows) {
					if(err) {
						fail(err);
					}
					else {
						okay(rows);
					}
				}
			);
		}.bind(this))
		.catch(callback)
		.then(function(records) {
			return Promise.denodeify(this._completeRecords.bind(this))(records);
		}.bind(this))
		.catch(callback)
		.then(function(records) {
			callback(null, records);
		});
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
		var record;
		new Promise(function(okay, fail) {
			this.pool.query("SELECT id, quote, used, user, submitted FROM Records WHERE id = ?", [id], function(err, rows) {
				if(err) {
					fail(err);
				}
				else {
					okay(rows[0]);
				}
			});
		}.bind(this))
		.catch(callback)
		.then(function(_record) {
			record = _record;
			var getUser = Promise.denodeify(this.getUserById.bind(this));
			var getLabels = Promise.denodeify(this.getLabelsOfRecord.bind(this));
			return Promise.all([getUser(record.user), getLabels(record.id)]);
		}.bind(this))
		.catch(callback)
		.then(function(result) {
			record.user = result[0];
			record.labels = result[1];
			callback(null, record);
		});
	};
	Database.prototype.getRandomRecord = function(callback) {
		new Promise(function(okay, fail) {
			this.pool.query("SELECT id FROM Records, (SELECT RAND() * (SELECT MAX(id) FROM Records) AS tid) AS Tmp WHERE Records.id >= Tmp.tid ORDER BY id ASC LIMIT 1", function(err, rows) {
				if(err) {
					fail(err);
				}
				else {
					okay(rows[0]);
				}
			});
		}.bind(this))
		.catch(callback)
		.then(function(record) {
			if(!record) {
				callback(null, null);
			}
			else return Promise.denodeify(this.getRecord.bind(this))(record.id);
		}.bind(this))
		.catch(callback)
		.then(function(record) {
			callback(null, record);
		});
	};
	Database.prototype.getLabelsOfRecord = function(recordId, callback) {
		this.pool.query("SELECT r.id AS id, r.name AS name FROM RecordLabels r LEFT JOIN RecordLabelRelation l ON l.label = r.id WHERE l.record = ?", [recordId], function(err, rows) {
			if(this._checkError(err, callback)) {
				if(callback) { callback(null, rows); }
			}
		}.bind(this));
	};
	Database.prototype.getRecordCount = function(callback) {
		this.pool.query("SELECT COUNT(id) AS amount FROM Records",
			function(err, rows) {
				if(this._checkError(err, callback)) {
					if(callback) { callback(null, rows[0].amount); }
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
		new Promise(function(okay, fail) {
			this.pool.query("SELECT id FROM Records LEFT JOIN RecordLabelRelation ON id = record WHERE label = ? ORDER BY used DESC", [label], function(err, rows) {
					if(err) {
						fail(err);
					}
					else {
						okay(rows);
					}
				}
			);
		}.bind(this))
		.catch(callback)
		.then(function(records) {
			return Promise.denodeify(this._completeRecords.bind(this))(records);
		}.bind(this))
		.catch(callback)
		.then(function(records) {
			callback(null, records);
		});
	};
};

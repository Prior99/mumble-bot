/*
 * Imports
 */
var Winston = require('winston');
var MySQL = require('mysql');
var FS = require("fs");

/*
 * Code
 */
var Database = function(options, callback) {
	this.pool = MySQL.createPool({
		host : options.host,
		user : options.user,
		password : options.password,
		database : options.database,
		multipleStatements : true,
		connectTimeout : options.connectTimeout ? options.connectTimeout : 4000
	});
	Winston.info("Connecting to database mysql://" + options.user + "@" + options.host + "/" + options.database + " ... ");
	this.pool.getConnection(function(err, conn) {
		if(err) {
			Winston.error("Connecting to database failed!");
			if(callback) { callback(err); }
			else { throw err; }
		}
		else {
			conn.release();
			Winston.info("Successfully connected to database!");
			this._setupDatabase(callback);
		}
	}.bind(this));
};

Database.prototype.addQuote = function(quote, author, callback) {
	if(quote && author) {
		this.pool.query("INSERT INTO Quotes(quote, author, submitted) VALUES(?, ?, ?)",
			[quote, author, new Date()], function(err, result) {
				if(err) {
					if(callback) { callback(err); }
					else throw err;
				}
				else {
					if(callback) { callback(null, result.insertId); }
				}
			}
		);
	}
	else {
		var err = new Error("Not all needed arguments were supplied.");
		if(callback) { callback(err); }
		else { throw err; }
	}
};

Database.prototype.getRandomQuote = function(callback) {
	this.pool.query("SELECT quote, author, submitted, used, id FROM Quotes, (SELECT RAND() * (SELECT MAX(id) FROM Quotes) AS tid) AS Tmp WHERE Quotes.id >= Tmp.tid ORDER BY id ASC LIMIT 1",
		function(err, rows) {
			if(err) {
				if(callback) { callback(err); }
				else throw err;
			}
			else {
				this.increaseQuoteUsage(rows[0].id);
				if(callback) { callback(null, rows[0]); }
			}
		}.bind(this)
	);
};

Database.prototype.getQuote = function(id, callback) {
	this.pool.query("SELECT quote, author, submitted, used FROM Quotes WHERE id = ?", [id],
		function(err, rows) {
			if(err) {
				if(callback) { callback(err); }
				else throw err;
			}
			else {
				if(rows.length >= 1) {
					this.increaseQuoteUsage(id);
					if(callback) { callback(null, rows[0]); }
				}
				else {
					var err = new Error("Unknown quote");
					if(callback) { callback(err); }
					else throw err;
				}
			}
		}.bind(this)
	);
};

Database.prototype.increaseQuoteUsage = function(id) {
	this.pool.query("UPDATE Quotes SET used = used + 1 WHERE id = ?", [id]);
};

Database.prototype.getQuoteCount = function(callback) {
	this.pool.query("SELECT COUNT(id) AS amount FROM Quotes",
		function(err, rows) {
			if(err) {
				if(callback) { callback(err); }
				else throw err;
			}
			else {
				if(callback) { callback(null, rows[0].amount); }
			}
		}
	);
};

Database.prototype.getQuoteList = function(callback) {
	this.pool.query("SELECT id, author, quote, submitted, used FROM Quotes",
		function(err, rows) {
			if(err) {
				if(callback) { callback(err); }
				else throw err;
			}
			else {
				if(callback) { callback(null, rows); }
			}
		}
	);
};

Database.prototype._setupDatabase = function(callback) {
	FS.readFile("schema.sql", {encoding : "utf8"}, function(err, data) {
		if(err) {
			throw err;
		}
		else {
			this.pool.query(data, function(err) {
				if(err) {
					Winston.error("An error occured while configuring database:", err);
					if(callback) { callback(err); }
					else { throw err; }
				}
				else  if(callback) { callback(); }
			});
		}
	}.bind(this));
};

Database.prototype.stop = function(callback) {
	this.pool.end(callback);
};

module.exports = Database;

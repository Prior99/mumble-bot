module.exports = function(Database) {
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
};

/**
 * Extends the database with methods for everything realted to quotes.
 * @param {Database} Database - The Database class to extend.
 * @return {undefined}
 */
const DatabaseQuotes = function(Database) {
	/**
	 * Add a quote to the database.
	 * @param {string} quote - Text of the quote.
	 * @param {string} author - Author of the quote.
	 * @param callback - Called once the query is done.
	 */
	Database.prototype.addQuote = function(quote, author, callback) {
		if(quote && author) {
			this.pool.query("INSERT INTO Quotes(quote, author, submitted) VALUES(?, ?, ?)",
				[quote, author, new Date()], function(err, result) {
					if(this._checkError(err, callback)) {
						if(callback) { callback(null, result.insertId); }
					}
				}.bind(this)
			);
		}
		else {
			var err = new Error("Not all needed arguments were supplied.");
			if(callback) { callback(err); }
			else { throw err; }
		}
	};

	/**
	* Returns a random quote from the database.
	* @param callback - Called once the query is done.
	*/
	Database.prototype.getRandomQuote = function(callback) {
		this.pool.query("SELECT quote, author, submitted, used, id FROM Quotes, (SELECT RAND() * (SELECT MAX(id) FROM Quotes) AS tid) AS Tmp WHERE Quotes.id >= Tmp.tid ORDER BY id ASC LIMIT 1",
			function(err, rows) {
				if(this._checkError(err, callback)) {
					this.increaseQuoteUsage(rows[0].id);
					if(callback) { callback(null, rows[0]); }
				}
			}.bind(this)
		);
	};
	/**
	* Looks up the details about a specified quote.
	* @param {number} quote - Quote to look up.
	* @param callback - Called once the query is done.
	*/
	Database.prototype.getQuote = function(id, callback) {
		this.pool.query("SELECT quote, author, submitted, used FROM Quotes WHERE id = ?", [id],
			function(err, rows) {
				if(this._checkError(err, callback)) {
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

	/**
	 * Increase the amount of time this quote has already been played back..
	 * @param {number} id - Id of the quote to increase the amount of.
	 */
	Database.prototype.increaseQuoteUsage = function(id) {
		this.pool.query("UPDATE Quotes SET used = used + 1 WHERE id = ?", [id]);
	};

	/**
	 * Retrieves the total amount of quotes in the database.
	 * @param callback - Called after the amount was retrieved.
	 */
	Database.prototype.getQuoteCount = function(callback) {
		this.pool.query("SELECT COUNT(id) AS amount FROM Quotes",
			function(err, rows) {
				if(this._checkError(err, callback)) {
					if(callback) { callback(null, rows[0].amount); }
				}
			}.bind(this)
		);
	};

	/**
	 * Retrieve a list with all quotes.
	 * @param callback - Called after the query was done.
	 */
	Database.prototype.getQuoteList = function(callback) {
		this.pool.query("SELECT id, author, quote, submitted, used FROM Quotes",
			function(err, rows) {
				if(this._checkError(err, callback)) {
					if(callback) { callback(null, rows); }
				}
			}.bind(this)
		);
	};
};

export default DatabaseQuotes;

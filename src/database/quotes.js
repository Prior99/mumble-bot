/**
 * Extends the database with methods for everything realted to quotes.
 * @param {Database} Database - The Database class to extend.
 * @return {undefined}
 */
const DatabaseQuotes = function(Database) {
	/**
	 * <b>Async</b> Add a quote to the database.
	 * @param {string} quote - Text of the quote.
	 * @param {string} author - Author of the quote.
	 * @return {number} - Unique id of the newly generated quote.
	 */
	Database.prototype.addQuote = async function(quote, author) {
		if(quote && author) {
			const result = await this.pool.query("INSERT INTO Quotes(quote, author, submitted) VALUES(?, ?, ?)",
				[quote, author, new Date()]
			);
			return result.insertId;
		}
		else {
			throw new Error("Not all needed arguments were supplied.");
		}
	};

	/**
	 * A quote in the database.
	 * @typedef Quote
	 * @property {string} quote The content of the quote.
	 * @property {string} author - The person from which the quote originated.
	 * @property {date} submitted - The date and time the quote was submitted.
	 * @property {number} used - How often the quote was already played back.
	 * @property {number} id - The unique id of this quote.
	 */
	/**
	 * <b>Async</b> Returns a random quote from the database.
	 * @return {Quote} - The randomly selected quote.
	 */
	Database.prototype.getRandomQuote = async function() {
		const rows = await this.pool.query(
			"SELECT quote, author, submitted, used, id FROM Quotes " +
			"(SELECT RAND() * (SELECT MAX(id) FROM Quotes) AS tid) AS Tmp " +
			"WHERE Quotes.id >= Tmp.tid ORDER BY id ASC LIMIT 1"
		);
		this.increaseQuoteUsage(rows[0].id);
		return rows[0];
	};

	/**
	 * <b>Async</b> Looks up the details about a specified quote.
	 * @param {number} id - Unique id of the quote to look up.
	 * @return {Quote} - The quote identified by the given id.
	 */
	Database.prototype.getQuote = async function(id) {
		const rows = await this.pool.query("SELECT quote, author, submitted, used FROM Quotes WHERE id = ?", [id]);
		if(rows.length >= 1) {
			this.increaseQuoteUsage(id);
			return rows[0];
		}
		else {
			throw new Error("Unknown quote");
		}
	};

	/**
	 * <b>Async</b> Increase the amount of time this quote has already been played back..
	 * @param {number} id - Id of the quote to increase the amount of.
	 * @return {undefined}
	 */
	Database.prototype.increaseQuoteUsage = async function(id) {
		await this.pool.query("UPDATE Quotes SET used = used + 1 WHERE id = ?", [id]);
	};

	/**
	 * <b>Async</b> Retrieves the total amount of quotes in the database.
	 * @return {number} - How many quotes are stored in the database.
	 */
	Database.prototype.getQuoteCount = async function() {
		const rows = await this.pool.query("SELECT COUNT(id) AS amount FROM Quotes");
		return rows[0].amount;
	};

	/**
	 * <b>Async</b> Retrieve a list with all quotes.
	 * @return {Quote[]} - A list with all quotes.
	 */
	Database.prototype.getQuoteList = async function() {
		const rows = await this.pool.query("SELECT id, author, quote, submitted, used FROM Quotes");
		return rows;
	};
};

export default DatabaseQuotes;

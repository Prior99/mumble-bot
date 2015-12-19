/**
 * Extends the database with methods for autocompletition.
 * @param {Database} Database - The Database class to extend.
 * @return {undefined}
 */
const AutocompleteExtension = function(Database) {
	/**
	 * <b>Async</b> Inserts a new text into the database of autocompletition texts.
	 * @param {string} sentence - The text to insert.
	 * @return {undefined}
	 */
	Database.prototype.enterAutoComplete = async function(sentence) {
		const q = "INSERT INTO AutoComplete(sentence) VALUES (?) ON DUPLICATE KEY UPDATE used = used + 1";
		await this.connection.query(q, [sentence]);
	};
	/**
	 * One autocompletition element.
	 * @typedef AutocompleteElement
	 * @property {number} id - Unique id.
	 * @property {string} sentence - The autocompleted string.
	 * @property {number} used- How often this sentence was already used.
	 */
	/**
	 * <b>Async</b> Look up a part in the autocompletition database.
	 * @param {string} part - The part to autocomplete.
	 * @return {AutocompleteElement[]} - Suggestions.
	 */
	Database.prototype.lookupAutoComplete = async function(part) {
		const q =
			"SELECT id, sentence, used " +
			"FROM AutoComplete " +
			"WHERE sentence LIKE ? " +
			"ORDER BY used DESC LIMIT 10";
		const rows = await this.connection.query(q, ["%" + part + "%"]);
		return rows;
	};
};
export default AutocompleteExtension;

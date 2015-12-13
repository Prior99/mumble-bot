/**
 * Extends the database with methods for autocompletition.
 * @param {Database} Database - The Database class to extend.
 * @return {undefined}
 */
const DatabaseAutocomplete = function(Database) {
	Database.prototype.enterAutoComplete = function(sentence, callback) {
		const q = "INSERT INTO AutoComplete(sentence) VALUES (?) ON DUPLICATE KEY UPDATE used = used + 1";
		this.pool.query(q, [sentence], (err, result) => {
			if(this._checkError(err, callback)) {
				callback(null);
			}
		});
	};
	Database.prototype.lookupAutoComplete = function(part, callback) {
		const q =
			"SELECT id, sentence, used " +
			"FROM AutoComplete " +
			"WHERE sentence LIKE ? " +
			"ORDER BY used DESC LIMIT 10";
		this.pool.query(q, ["%" + part + "%"], (err, rows) => {
			if(this._checkError(err, callback)) {
				callback(null, rows);
			}
		});
	};
};
export default DatabaseAutocomplete;

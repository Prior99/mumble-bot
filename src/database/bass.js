/**
 * Extends the database with methods for the bass endpoints.
 * @param {Database} Database - The Database class to extend.
 * @return {undefined}
 */
const DatabaseBass = function(Database) {
	/**
	 * <b>Async</b> Insert a new bass "effect" word into the database.
	 * @param {string} effect - Word to insert
	 * @param {callback} callback - Called when the query is done.
	 * @return {undefined}
	 */
	Database.prototype.addBassEffect = async function(effect) {
		const result = await this.pool.query("INSERT INTO BassEffects(effect) VALUES (?)", [effect]);
		return result.insertId;
	};

	/**
	 * <Async</b> Lists all bass effect words in the database.
	 * @param {callback} callback - Called when the query is done.
	 * @return {undefined}
	 */
	Database.prototype.listBassEffects = async function() {
		const rows = await this.pool.query("SELECT effect FROM BassEffects");
		const arr = [];
		for(const row of rows) {
			arr.push(row.effect);
		}
		return arr;
	};
};

export default DatabaseBass;

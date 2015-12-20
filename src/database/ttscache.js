/**
 * Extends the database with methods for the TTS cache.
 * @param {Database} Database - The Database class to extend.
 * @return {undefined}
 */
const TTSCacheExtension = function(Database) {
	/**
	 * <b>Async</b> Fetches a cached TTS MP3 file or null if the file for the given text was
	 * not yet synthesized.
	 * @param {string} api - Identifier of the api to use.
	 * @param {string} text - Text for which a MP3 file should be retrieved.
	 * @return {number} - The filename of the cached file (Files are named after numerical generated ids).
	 */
	Database.prototype.getCachedTTS = async function(api, text) {
		const rows = await this.connection.query(
			"SELECT id AS filename " +
			"FROM TTSCache " +
			"WHERE text LIKE ? AND api = ?", [text.toLowerCase(), api]
		);
		if(rows && rows.length > 0) {
			return rows[0].filename;
		}
		else {
			return null;
		}
	};

	/**
	 * <b>Async</b> Adds a new TTS MP3 file to the cache.
	 * @param {string} api - Name of the api this cached audio belongs to.
	 * @param {string} text - Text for which a MP3 was newly generated.
	 * @return {number} - Unique generated id of the new entry.
	 */
	Database.prototype.addCachedTTS = async function(api, text) {
		const result = await this.connection.query(
			"INSERT INTO TTSCache(text, api) VALUES(?, ?)", [text.toLowerCase(), api]
		);
		return result.insertId;
	};
};

export default TTSCacheExtension;

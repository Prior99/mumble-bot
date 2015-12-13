/**
 * Extends the database with methods for the TTS cache.
 * @param {Database} Database - The Database class to extend.
 * @return {undefined}
 */
const DatabaseTTSCache = function(Database) {
	/**
	 * Fetches a cached TTS MP3 file or null if the file for the given text was
	 * not yet synthesized.
	 * @param {string} api - Identifier of the api to use.
	 * @param {string} text - Text for which a MP3 file should be retrieved.
	 * @param callback - Called when the query has been done.
	 */
	Database.prototype.getCachedTTS = function(api, text, callback) {
		this.pool.query("SELECT id AS filename FROM TTSCache WHERE text LIKE ? AND api = ?", [text.toLowerCase(), api],
			function(err, rows) {
				if(this._checkError(err, callback)) {
					if(callback) {
						if(rows.length >= 1) {
							callback(null, rows[0].filename);
						}
						else {
							callback(null, null);
						}
					}
				}
			}.bind(this)
		);
	};

	/**
	 * Adds a new TTS MP3 file to the cache.
	 * @param {string} text - Text for which a MP3 was newly generated.
	 * @param callback - Called when the text was synthesized with the id of the
	 *					 entry after which the file should be named.
	 */
	Database.prototype.addCachedTTS = function(api, text, callback) {
		this.pool.query("INSERT INTO TTSCache(text, api) VALUES(?, ?)", [text.toLowerCase(), api],
			function(err, result) {
				if(this._checkError(err, callback)) {
					if(callback) { callback(null, result.insertId); }
				}
			}.bind(this)
		);
	};
};

export default DatabaseTTSCache;

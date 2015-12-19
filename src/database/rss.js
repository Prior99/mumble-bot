/**
 * Extends the database with methods for the RSS feeds.
 * @param {Database} Database - The Database class to extend.
 * @return {undefined}
 */
const RSSExtension = function(Database) {
	/**
	 * @typedef RSSFeed
	 * @property {string} url - URL to the RSS feed.
	 * @property {string} name - Human readable name of the feed.
	 * @property {number} id - Unique numerical id for the feed.
	 */
	/**
	 * <b>Async</b> Add a new RSS feed that should be crawled.
	 * @param {string} url - URL of the feed to subscribe to.
	 * @param {string} name - Name of the feed.
	 * @return {undefined}
	 */
	Database.prototype.addRSSFeed = async function(url, name) {
		await this.connection.query("INSERT INTO RSS(url, name) VALUES (?, ?)", [url, name]);
	};

	/**
	 * <b>Async</b> Remove a RSS feed to be crawled from the pool of RSS feeds to crawl.
	 * @param {number} id - Unique id of the feed to unsubscribe.
	 * @return {undefined}
	 */
	Database.prototype.removeRSSFeed = async function(id) {
		await this.connection.query("DELETE FROM RSS WHERE id = ?", [id]);
	};

	/**
	 * <b>Async</b> Get a list of all subscribed RSS feeds.
	 * @return {RSSFeed[]} - List of all subscribed RSS feeds.
	 */
	Database.prototype.listRSSFeeds = async function() {
		const rows = await this.connection.query("SELECT id, url, name FROM RSS");
		return rows;
	};

	/**
	 * <b>Async</b> Check whether an article is already known.
	 * @param {string} hash - Unique hash of the article.
	 * @return {boolean} - Whether the article is already known.
	 */
	Database.prototype.isRSSFeedEntryKnown = async function(hash) {
		const rows = await this.connection.query("SELECT hash FROM KnownRSSEntries WHERE hash = ?", [hash]);
		return rows && rows.length > 0;
	};

	/**
	 * <b>Async</b> Add an article to the list of already known RSS articles.
	 * @param {string} hash - Unique hash of the article.
	 * @param {string} url - URL of the article.
	 * @return {undefined}
	 */
	Database.prototype.addKnownRSSFeedEntry = async function(hash, url) {
		await this.connection.query("INSERT INTO KnownRSSEntries(hash, url, seen) VALUES(?, ?, ?)", [hash, url, new Date()]);
	};
};

export default RSSExtension;

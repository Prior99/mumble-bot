import * as Crypto from "crypto";
import * as FeedRead from "feed-read";
import * as StripTags from "striptags";
import Winston from "winston";

const msInS = 1000;

/**
 * This class handles RSS feeds.
 */
class RSS {

	/**
	 * @constructor
	 * @param {Bot} bot The bot.
	 */
	constructor(bot) {
		this.bot = bot;
		this._interval = setInterval(this.fetch.bind(this), bot.options.rssFetchInterval * msInS);
		this.bot.newCommand("fetch-rss", this.fetch.bind(this), "Aktualisiert alle RSS Feeds.", "rss");
	}

	/**
	 * Fetch the feed and handle all articles.
	 * @param {object} feed - Information about the RSS feed.
 	 * @param {string} feed.url - URL of the RSS feed.
	 * @return {undefined}
	 */
	fetchFeed(feed) {
		FeedRead.get(feed.url, (err, articles) => {
			if(err) {
				Winston.error("Error loading RSS feed from " + feed.url, err);
			}
			else {
				articles.forEach(article => {
					this._handleArticle(article, feed);
				});
			}
		});
	}

	/**
	 * <b>Async</b> If the article is not yet know, announce it in the mumble and store it as known.
	 * @param {object} article - A single article from the feed.
 	 * @param {string} article.title - The title of the article.
 	 * @param {string} article.content - The content of the article.
 	 * @param {string} article.link - The url to the article.
 	 * @param {object} feed - The RSS feed.
 	 * @param {string} feed.name - The name of the RSS feed.
	 * @return {undefined}
	 */
	async _handleArticle(article, feed) {
		const known = await this.isArticleKnown(article);
		if(!known) {
			const newArticle = {
				title : StripTags(article.title).trim(),
				content : StripTags(article.content).trim(),
				url : article.link
			};
			if(newArticle.title && newArticle.content) {
				this.bot.say(
					"Neuer Artikel auf " + feed.name + ": " + newArticle.title + " - " + newArticle.content
				);
			}
			else if(!newArticle.title && newArticle.content) {
				this.bot.say("Neuer Artikel auf " + feed.name + ": " + newArticle.content);
			}
			else if(newArticle.title && !newArticle.content) {
				this.bot.say("Neuer Artikel auf " + feed.name + ": " + newArticle.title);
			}
			this.markArticleAsRead(article);
		}
	}

	/**
	 * <b>Async</b> Fetch all known RSS feeds.
	 * @return {undefined}
	 */
	async fetch() {
		Winston.info("Refreshing RSS Feeds...");
		try {
			const feeds = await this.bot.database.listRSSFeeds();
			feeds.forEach(feed => {
				this.fetchFeed(feed);
			});
		}
		catch(err) {
			Winston.error("Could not fetch list of subscribed rss feeds.", err);
		}
	}

	/**
	 * Mark all articles of one URL as read.
	 * @param {string} url - The URL which to mark everything as read.
	 * @return {undefined}
	 */
	markAllArticlesAsKnown(url) {
		FeedRead.get(url, (err, articles) => {
			if(err) {
				Winston.error("Error marking everything as read in RSS feed from " + url, err);
			}
			else {
				articles.forEach(article => this.markArticleAsRead(article));
			}
		});
	}

	/**
	 * <b>Async</b> Checks whether an article is already known or whether not.
	 * @param {object} article - A single article from the feed.
	 * @return {boolean} - True when the feed is known.
	 */
	async isArticleKnown(article) {
		try {
			const known = await this.bot.database.isRSSFeedEntryKnown(this.hashArticle(article));
			return known;
		}
		catch(err) {
			Winston.error("Could not determine whether article was already known.", err);
			return false;
		}
	}

	/**
	 * Marks an article as read.
	 * @param {object} article - A single article from the feed.
	 * @return {undefined}
	 */
	markArticleAsRead(article) {
		this.bot.database.addKnownRSSFeedEntry(this.hashArticle(article), article.link);
	}

	/**
	 * Generates a unique md5 hash from an article.
	 * @param {object} article - A single article from the feed.
 	 * @param {string} article.title - The title of the article.
 	 * @param {string} article.author - Author of the article.
 	 * @param {string} article.link - The url to the article.
	 * @return {undefined}
	 */
	hashArticle(article) {
		return Crypto.createHash("md5").update(article.title + article.author + article.link).digest("hex");
	}
	/**
	 * Stop the RSS module.
	 * @return {undefined}
	 */
	stop() {
		clearInterval(this._interval);
	}
}

export default RSS;

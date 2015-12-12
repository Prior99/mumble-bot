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
		setInterval(this.fetch.bind(this), bot.options.rssFetchInterval * msInS);
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
	 * If the article is not yet know, announce it in the mumble and store it as known.
	 * @param {object} article - A single article from the feed.
 	 * @param {string} article.title - The title of the article.
 	 * @param {string} article.content - The content of the article.
 	 * @param {string} article.link - The url to the article.
 	 * @param {object} feed - The RSS feed.
 	 * @param {string} feed.name - The name of the RSS feed.
	 * @return {undefined}
	 */
	_handleArticle(article, feed) {
		this.isArticleKnown(article, known => {
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
		});
	}

	/**
	 * Fetch all known RSS feeds.
	 * @return {undefined}
	 */
	fetch() {
		Winston.info("Refreshing RSS Feeds...");
		this.bot.database.listRSSFeeds((err, feeds) => {
			if(err) {
				Winston.error("Could not fetch list of subscribed rss feeds.", err);
			}
			else {
				feeds.forEach(feed => {
					this.fetchFeed(feed);
				});
			}
		});
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
				articles.forEach(article => {
					this.markArticleAsRead(article);
				});
			}
		});
	}

	/**
	 * Checks whether an article is already known or whether not.
	 * @param {object} article - A single article from the feed.
	 * @param {BooleanCallback} callback - Called when the check is done.
	 * @return {undefined}
	 */
	isArticleKnown(article, callback) {
		this.bot.database.isRSSFeedEntryKnown(this.hashArticle(article), (err, known) => {
			if(err) {
				Winston.error("Could not determine whether article was already known.", err);
				callback(false);
			}
			else {
				callback(known);
			}
		});
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
}

export default RSS;

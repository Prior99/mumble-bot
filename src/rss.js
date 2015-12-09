import * as Crypto from "crypto";
import * as FeedRead from "feed-read";
import * as StripTags from "striptags";
import Winston from "winston";

const msInS = 1000;

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

	_handleArticle(article, feed) {
		this.isArticleKnown(article, known => {
			if(!known) {
				const newArticle = {
					title : StripTags(article.title).trim(),
					content : StripTags(article.content).trim(),
					url : article.link
				};
				if(newArticle.title && newArticle.content) {
					this.bot.say("Neuer Artikel auf " + feed.name + ": " + newArticle.title + " - " + newArticle.content);
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

	markArticleAsRead(article) {
		this.bot.database.addKnownRSSFeedEntry(this.hashArticle(article), article.link);
	}

	hashArticle(article) {
		return Crypto.createHash("md5").update(article.title + article.author + article.link).digest("hex");
	}
}

module.exports = RSS;

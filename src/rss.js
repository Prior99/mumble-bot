var Crypto = require('crypto');
var FeedRead = require('feed-read');
var StripTags = require('striptags');
var Winston = require('winston');

var RSS = function(bot) {
	this.bot = bot;
	setInterval(this.fetch.bind(this), bot.options.rssFetchInterval * 1000);
	this.bot.newCommand("fetch-rss", this.fetch.bind(this), "Aktualisiert alle RSS Feeds.", "rss");
};

RSS.prototype.fetchFeed = function(feed) {
	FeedRead.get(feed.url, function(err, articles) {
		if(err) {
			Winston.error("Error loading RSS feed from " + feed.url, err);
		}
		else {
			articles.forEach(function(article) {
				this._handleArticle(article, feed);
			}.bind(this));
		}
	}.bind(this));
};

RSS.prototype._handleArticle = function(article, feed) {
	this.isArticleKnown(article, function(known) {
		if(!known) {
			var newArticle = {
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
	}.bind(this));
};

RSS.prototype.fetch = function() {
	Winston.info("Refreshing RSS Feeds...");
	this.bot.database.listRSSFeeds(function(err, feeds) {
		if(err) {
			Winston.error("Could not fetch list of subscribed rss feeds.", err);
		}
		else {
			feeds.forEach(function(feed) {
				this.fetchFeed(feed);
			}.bind(this));
		}
	}.bind(this));
};

RSS.prototype.markAllArticlesAsKnown = function(url) {
	FeedRead.get(url, function(err, articles) {
		if(err) {
			Winston.error("Error marking everything as read in RSS feed from " + url, err);
		}
		else {
			articles.forEach(function(article) {
				this.markArticleAsRead(article);
			}.bind(this));
		}
	}.bind(this));
}

RSS.prototype.isArticleKnown = function(article, callback) {
	this.bot.database.isRSSFeedEntryKnown(this.hashArticle(article), function(err, known) {
		if(err) {
			Winston.error("Could not determine whether article was already known.", err);
			callback(false);
		}
		else {
			callback(known);
		}
	});
};

RSS.prototype.markArticleAsRead = function(article) {
	this.bot.database.addKnownRSSFeedEntry(this.hashArticle(article), article.link);
};

RSS.prototype.hashArticle = function(article) {
	return Crypto.createHash('md5').update(article.title + article.author + article.link).digest('hex');
};


module.exports = RSS;

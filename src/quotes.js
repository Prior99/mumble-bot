/*
 * Imports
 */
var Winston = require('winston');
/*
 * Code
 */
var Quotes = function(bot) {
	this.bot = bot;
	bot.newCommand("speak", function() {
		this.speakRandom();
	}.bind(this));
};

Quotes.prototype.speak = function(id, callback) {
	if(id === undefined) {
		this.speakRandom(callback);
	}
	else {
		this.bot.database.getQuote(id, function(err, quote) {
			if(err) {
				Winston.error("Error fetching random quote: " + err);
			}
			else {
				this._dispatch(quote, callback);
			}
		}.bind(this));
	}
};

Quotes.prototype.add = function(quote, author, callback) {
	this.bot.database.addQuote(quote, author, callback);
};

Quotes.prototype.list = function(callback) {
	this.bot.database.getQuoteList(callback);
};

Quotes.prototype.count = function(callback) {
	this.bot.database.getQuoteCount(callback);
};

Quotes.prototype._dispatch = function(quote, callback) {
	this.bot.say(quote.quote, callback);
};

Quotes.prototype.speakRandom = function(callback) {
	this.bot.database.getRandomQuote(function(err, quote) {
		if(err) {
			Winston.error("Error fetching random quote: " + err);
		}
		else {
			this._dispatch(quote, callback);
		}
	}.bind(this));
};

module.exports = Quotes;

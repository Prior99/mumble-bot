/*
 * Imports
 */
var Winston = require('winston');
/*
 * Code
 */

/**
 * Provides a more nice to use interface for handling quotes than operating
 * directly on the database.
 * @constructor
 * @param {Bot} bot - Bot this instance is connected to.
 */
var Quotes = function(bot) {
	this.bot = bot;
	bot.newCommand("speak", function() {
		this.speakRandom();
	}.bind(this), "Gibt einen zufälligen intelligenten Kommentar aus der Datenbank aus.", "quote-left");
};

/**
 * Speak a quote. If the id is defined, a specific quote will be spoken. If it
 * is undefined, a random quote will be chosen from the database.
 * @param {number} id - Id of the quote to speak. If this is undefined a random
 * 						quote will be chosen.
 * @param callback - Will be called once the quote was spoken.
 */
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

/**
 * Add a quote to the database.
 * @param {string} quote - Text of the quote.
 * @param {string} author - Author of the quote.
 * @param callback - `Called once the quote was submitted.
 */
Quotes.prototype.add = function(quote, author, callback) {
	this.bot.database.addQuote(quote, author, callback);
};

/**
 * Retrieve an array of all known quotes.
 * @param callback - Called once the array was retrieved.
 */
Quotes.prototype.list = function(callback) {
	this.bot.database.getQuoteList(callback);
};

/**
 * Counts all quotes in the database.
 * @param callback - Called once the quotes were counted.
 */
Quotes.prototype.count = function(callback) {
	this.bot.database.getQuoteCount(callback);
};

Quotes.prototype._dispatch = function(quote, callback) {
	this.bot.say(quote.quote, callback);
};

/**
 * Speaks a randomly chosen quote from the database.
 * @param callback - Called once the quote was spoken.
 */
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

/*
 * Imports
 */
import * as Winston from "winston";
/*
 * Code
 */
/**
 * Provides a more nice to use interface for handling quotes than operating
 * directly on the database.
 */
class Quotes {
	/**
	 * @constructor
	 * @param {Bot} bot - Bot this instance is connected to.
	 */
	constructor(bot) {
		this.bot = bot;
		bot.newCommand("speak", () => this.speakRandom(),
			"Gibt einen zufälligen intelligenten Kommentar aus der Datenbank aus.", "quote-left"
		);
		Winston.info("Module started: Quotes");
	}

	/**
	 * Speak a quote. If the id is defined, a specific quote will be spoken. If it
	 * is undefined, a random quote will be chosen from the database.
	 * @param {number} id - Id of the quote to speak. If this is undefined a random
	 * 						quote will be chosen.
	 * @param {callback} callback - Will be called once the quote was spoken.
	 * @return {undefined}
	 */
	speak(id, callback) {
		if(id === undefined) {
			this.speakRandom(callback);
		}
		else {
			this.bot.database.getQuote(id, (err, quote) => {
				if(err) {
					Winston.error("Error fetching random quote: " + err);
				}
				else {
					this._dispatch(quote, callback);
				}
			});
		}
	}

	/**
	 * Add a quote to the database.
	 * @param {string} quote - Text of the quote.
	 * @param {string} author - Author of the quote.
	 * @param {callback} callback - `Called once the quote was submitted.
	 * @return {undefined}
	 */
	add(quote, author, callback) {
		this.bot.database.addQuote(quote, author, callback);
	}

	/**
	 * Retrieve an array of all known quotes.
	 * @param {callback} callback - Called once the array was retrieved.
	 * @return {undefined}
	 */
	list(callback) {
		this.bot.database.getQuoteList(callback);
	}

	/**
	 * Counts all quotes in the database.
	 * @param {callback} callback - Called once the quotes were counted.
	 * @return {undefined}
	 */
	count(callback) {
		this.bot.database.getQuoteCount(callback);
	}

	/**
	 * Dispatch the actual quote (say it using TTS) to the bot.
	 * @param {string} quote - Quote to synthesize and speak.
	 * @param {callback} callback - Will be called after the text was spoken.
	 * @return {undefined}
	 */
	_dispatch(quote, callback) {
		this.bot.say(quote.quote, callback);
	}

	/**
	 * Speaks a randomly chosen quote from the database.
	 * @param {callback} callback - Called once the quote was spoken.
	 * @return {undefined}
	 */
	speakRandom(callback) {
		this.bot.database.getRandomQuote((err, quote) => {
			if(err) {
				Winston.error("Error fetching random quote: " + err);
			}
			else {
				this._dispatch(quote, callback);
			}
		});
	}
}

export default Quotes;

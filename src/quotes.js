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
	 * <b>Async</b> Speak a quote. If the id is defined, a specific quote will be spoken. If it
	 * is undefined, a random quote will be chosen from the database.
	 * @param {number} id - Id of the quote to speak. If this is undefined a random
	 * 						quote will be chosen.
	 * @param {callback} callback - Will be called once the quote was spoken.
	 * @return {undefined}
	 */
	async speak(id, callback) {
		if(id === undefined) {
			this.speakRandom(callback);
		}
		else {
			try {
				const quote = await this.bot.database.getQuote(id);
				this._dispatch(quote, callback);
			}
			catch(err) {
				Winston.error("Error fetching random quote: " + err);
			}
		}
	}

	/**
	 * <b>Async</b> Add a quote to the database.
	 * @param {string} quote - Text of the quote.
	 * @param {string} author - Author of the quote.
	 * @return {number} - Unique id of the new quote.
	 */
	async add(quote, author) {
		const id = await this.bot.database.addQuote(quote, author);
		return id;
	}

	/**
	 * <b>Async</b> Retrieve an array of all known quotes.
	 * @param {callback} callback - Called once the array was retrieved.
	 * @return {Quote[]} - All quotes in the database.
	 */
	async list(callback) {
		const list = await this.bot.database.getQuoteList();
		return list;
	}

	/**
	 * <b>Async</b> Counts all quotes in the database.
	 * @param {callback} callback - Called once the quotes were counted.
	 * @return {number} - Amount of quotes in the database.
	 */
	async count() {
		const amount = await this.bot.database.getQuoteCount();
		return amount;
	}

	/**
	 * <b>Async</b> Dispatch the actual quote (say it using TTS) to the bot.
	 * @param {string} quote - Quote to synthesize and speak.
	 * @return {undefined}
	 */
	async _dispatch(quote) {
		await this.bot.say(quote.quote);
	}

	/**
	 * <b>Async</b> Speaks a randomly chosen quote from the database.
	 * @return {undefined}
	 */
	async speakRandom() {
		try {
			const quote = await this.bot.database.getRandomQuote();
			await this._dispatch(quote);
		}
		catch(err) {
			Winston.error("Error fetching random quote: " + err);
		}
	}
}

export default Quotes;

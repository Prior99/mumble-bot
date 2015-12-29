
import Winston from "winston";

const msInS = 1000;

/**
 * This object is responsible for maintaining an activity tab.
 * When a user in the same channel as the bot stays afk for a `config` time
 * he is notified and then moved to the afk channel.
 */
class AFKObserver {
	/**
	 * @param {Bot} bot The bot object.
	 * @returns {undefined}
	 */
	constructor(bot) {
		this.times = [];
		this.bot = bot;
		this.bot.mumble.on("user-move", (user, oldc, newc) => this.someUserMoved(user, oldc, newc));
		//TODO this event is not documented with these parameters (user oldc newc)!
		this.bot.mumble.on("user-connect", (user) => this.someUserMoved(user, undefined, user.channel));
		this.bot.mumble.on("user-disconnect", (user) => this.someUserMoved(user, undefined, undefined));
		this._interval = setInterval(this.check, msInS);
		Winston.info("Module started: AFKObserver");
		Winston.info("Warn time: " + this.bot.options.afkWarnTimeout);
		Winston.info("AFK time: " + this.bot.options.afkTimeout);
	}

	/**
	 * @param {User} user The user which moved.
	 * @param {Channel} oldc The channel ha came from.
	 * @param {Channel} newc The channel he went to.
	 * @returns {undefined}
	 */
	someUserMoved(user, oldc, newc) {
		const afkChannel = this.bot.mumble.channelByName(this.bot.options.afkChannel);
		const botChannel = this.bot.mumble.user.channel;

		//bot moved
		if(user.session === this.bot.mumble.session) {
			//to afkchannel
			if(botChannel === afkChannel) {
				this.times = [];
			}
			//to some other channel
			else {
				this.refreshChannel(newc);
			}
		}
		//user moved to non-afk bot channel
		else if(newc === botChannel && newc !== afkChannel) {
			this.registerUser(user);
		}
		//user moved to non-bot channel || disco
		else if(oldc === botChannel || !oldc) {
			this.unregisterUser(user);
		}
	}

	/**
	 * Called when bot moves to a new channel.
	 * @param {Channel} newc The channel he went to.
	 * @returns {undefined}
	 */
	refreshChannel(newc) {
		this.times = [];
		newc.users.forEach(this.registerUser.bind(this));
	}

	/**
	 * Registers an activity listener for the given user.
	 * @param {User} user The user which will be registered.
	 * @returns {undefined}
	 */
	registerUser(user) {
		//don"t mark yourself as afk
		if(user.session !== this.bot.mumble.session) {
			Winston.info("Registering AFKhandler for user " + user.name);
			this.times[user.session] = Date.now();
			user.outputStream(true).on("data", () => {
				const now = Date.now();
				const idleTime = (now - this.times[user.session])/msInS;
				this.times[user.session] = Date.now();
				if(idleTime > this.bot.options.afkWarnTimeout) {
					this.bot.sayOnlyVoice("Ok.");
					//user.sendMessage("AFK Status zurückgesetzt.");
				}
			});
		}
	}

	/**
	 * Removes the times-entry ot the user. Does not remove the data listener.
	 * To fully unregister an afkHandler the user must also be moved to another channel.
	 * @param {User} user The user.
	 * @returns {undefined}
	 */
	unregisterUser(user) {
		delete this.times[user.session];
	}

	/**
	 * Checks whether the watched users were afk,
	 * warns them about being afk,
	 * moves them to the afk channel.
	 * @returns {undefined}
	 */
	check() {
		const now = Date.now();
		const toDelete = [];
		for(const key in this.times) {
			if(this.times.hasOwnProperty(key)) {
				const idleTime = Math.round((now - this.times[key])/msInS);
				const mumbleUser = this.bot.mumble.userBySession(key);
				if(mumbleUser) {
					if(idleTime >= this.bot.options.afkTimeout) {
						mumbleUser.sendMessage("Da du über " + this.bot.options.afkTimeout
							+ " Sekunden inaktiv warst, wirst du in den AFK-Channel verschoben.");
						mumbleUser.moveToChannel(this.bot.options.afkChannel);
						this.unregisterUser(mumbleUser);
						this.bot.sayImportant(mumbleUser.name + " ist jetzt AFK.");
					}
					else if(idleTime === this.bot.options.afkWarnTimeout) {
						this.bot.sayOnlyVoice(mumbleUser.name + ", bist du AFK?");
					}
				}
				else {
					toDelete.push(t);
				}
			}
		}
		for(const t of toDelete) {
			delete this.times[t];
		}
	}
	/**
	 * Stop the AFK Observer.
	 * @return {undefined}
	 */
	stop() {
		clearInterval(this._interval);
	}
}

module.exports = AFKObserver;

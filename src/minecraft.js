
/*
 * Includes
 */
import * as Mineflayer from "mineflayer";
import * as Winston from "winston";
import EventEmitter from "events";

/*
 * Code
 */

/**
 * This  class handles the connection of the bot to minecraft.
 */
class Minecraft extends EventEmitter {
	/**
	 * @constructor
	 * @param {object} options - Options for the connection read from config file.
	 * @param {string} options.host - Host to connect to (ip or domain).
	 * @param {number} options.port - Port to connect to.
	 * @param {Bot} bot - The bot this minecraft class is attached to.
	 */
	constructor(options, bot) {
		super();
		this.bot = bot;
		Winston.info("Connecting to Minecraft server on " +
			options.host + ":" + options.port + " as " + bot.options.name + " ..."
		);
		this.mc = Mineflayer.createBot({
			host : options.host,
			port : options.port,
			username : bot.options.name,
			keepAlive : true
		});
		this._ready = false;
		this.mc.once("spawn", () => {
			Winston.info("Connected to minecraft and spawned at " + this.mc.entity.position);
			this._ready = true;
		});
		this.mc.on("chat", this._onChat.bind(this));
	}
	/**
	 * <b>Async</b> Called when a message was received.
	 * @param {string} username - Username of the user who sent the message.
	 * @param {string} message - The message that was received.
	 * @return {undefined}
	 */
	async _onChat(username, message) {
		if(username !== this.mc.username) {
			try {
				const user = await this.bot.database.getUserByMinecraftUsername(username);
				this.bot.command.processPrefixed(message, "minecraft", user);
			}
			catch(err) {
				Winston.error("Error fetching user by minecraft username.", err);
			}
		}
	}

	/**
	 * Say something in the minecraft servers chat.
	 * @param {string} msg - The message to say in the servers chat
	 * @return {undefined}
	 */
	say(msg) {
		if(this._ready) {
			this.mc.chat(msg);
		}
	}

	/**
	 * Disconnect from minecraft gently and shutdown this instance.
	 * @return {undefined}
	 */
	stop() {
		Winston.info("Closing connection to Minecraft ...");
		this.mc.on("end", () => Winston.info("Disconnected from Minecraft."));
		this.mc.quit();
	}
}

export default Minecraft;

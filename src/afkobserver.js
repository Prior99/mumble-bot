
/**
 * This object is responsible for maintaining an activity tab.
 * When a user in the same channel as the bot stays afk for a `config` time
 * he is notified and then moved to the afk channel.
 */
var AFKObserver = function(bot) {
	this.times = [];
	this.bot = bot;
	this.bot.mumble.on( 'user-move', this.someUserMoved.bind(this));
	//TODO this event is not documented with these parameters (user oldc newc)!
	this.bot.mumble.on('user-connect', function(user) {
		this.someUserMoved(user, undefined, user.channel);
	}.bind(this));
	this.bot.mumble.on('user-disconnect', function(user) {
		this.someUserMoved(user, undefined, undefined);
	}.bind(this));
	setInterval(this.check.bind(this), 1000);
};

AFKObserver.prototype.someUserMoved = function(user, oldc, newc) {
	var afkChannel = this.bot.mumble.channelByName(this.bot.options.afkChannel);
	var botChannel = this.bot.mumble.user.channel;
	
	//bot moved
	if(user.session == this.bot.mumble.session) {
		//to afkchannel
		if(botChannel == afkChannel) {
			this.times = [];
		}
		//to some other channel
		else {
			this.refreshChannel(newc);
		}
	}
	//user moved to non-afk bot channel
	else if(newc == botChannel && newc != afkChannel) {
		this.registerUser(user);
	}
	//user moved to non-bot channel || disco
	else if(oldc == botChannel || !oldc) {
		this.unregisterUser(user);
	}
};


/**
 * Called when bot moves to a new channel.
 */
AFKObserver.prototype.refreshChannel = function(newc) {
	this.times = [];
	newc.users.forEach(this.registerUser.bind(this));
};

/**
 * Registers an activity listener for the given user. 
 */
AFKObserver.prototype.registerUser = function(user) {
	//don't mark yourself as afk
	if(user.session == this.bot.mumble.session)
		return;
	this.times[user.session] = Date.now();
	user.outputStream(true).on('data', function() {
		var now = Date.now();
		var idleTime = (now - this.times[user.session])/1000;
		this.times[user.session] = Date.now();
		if(idleTime > this.bot.options.afkWarnTimeout) {
			this.bot.say("Ok.");
			//user.sendMessage("AFK Status zurückgesetzt.");
		}
	}.bind(this));
};

/**
 * Removes the times-entry ot the user
 */
AFKObserver.prototype.unregisterUser = function(user) {
	delete this.times[user.session];
};

/**
 * Checks whether the watched users were afk,
 * warns them about being afk,
 * moves them to the afk channel.
 */
AFKObserver.prototype.check = function() {
	var now = Date.now();
	for(var key in this.times) {
		var idleTime = Math.round((now - this.times[key])/1000);
		var mumbleUser = this.bot.mumble.userBySession(key);
		if(mumbleUser) {
			if(idleTime >= this.bot.options.afkTimeout) {
				mumbleUser.sendMessage("Da du über " + this.bot.options.afkTimeout + " Sekunden inaktiv warst, wirst du in den AFK-Channel verschoben.");
				mumbleUser.moveToChannel(this.bot.options.afkChannel);
				this.unregisterUser(mumbleUser);
				this.bot.sayImportant(mumbleUser.name + " ist jetzt AFK.");
			}
			else if(idleTime == this.bot.options.afkWarnTimeout) {
				this.bot.sayImportant(mumbleUser.name + ", bist du AFK?");
				//mumbleUser.sendMessage("Du bist seit " + idleTime + " Sekunden inaktiv. Wenn in den nächsten " + (this.bot.options.afkTimeout - this.bot.options.afkWarnTimeout) + " Sekunden keine Aktivität besteht, wirst du als AFK gewertet.");
			}
		}
		else {
			delete this.times[key];
		}
	}
};

module.exports = AFKObserver;


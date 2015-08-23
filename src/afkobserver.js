var AFKObserver = function(bot) {
	this.times = {};
	this.bot = bot;
	this.refreshUsers();
	this.bot.mumble.on('user-connect', this.refreshUser.bind(this));
	setInterval(this.check.bind(this), 1000);
};

AFKObserver.prototype.check = function() {
	var now = Date.now();
	for(var key in this.times) {
		var idleTime = Math.round((now - this.times[key])/1000);
		var mumbleUser = this.bot.mumble.userBySession(key);
		if(mumbleUser) {
			if(mumbleUser.channel.name !== this.bot.options.afkChannel) {
				if(idleTime == this.bot.options.afkTimeout) {
					mumbleUser.sendMessage("Da du über " + this.bot.options.afkTimeout + " Sekunden inaktiv warst, wirst du in den AFK-Channel verschoben.");
					mumbleUser.moveToChannel(this.bot.options.afkChannel);
					this.bot.sayImportant(mumbleUser.name + " ist jetzt AFK.");
				}
				else if(idleTime == this.bot.options.afkWarnTimeout) {
					mumbleUser.sendMessage("Du bist seit " + idleTime + " Sekunden inaktiv. Wenn in den nächsten " + (this.bot.options.afkTimeout - this.bot.options.afkWarnTimeout) + " Sekunden keine Aktivität besteht, wirst du als AFK gewertet.");
				}
			}
		}
		else {
			this.times[key] = undefined;
		}
	}
};

AFKObserver.prototype.refreshUsers = function() {
	this.bot.mumble.users().forEach(this.refreshUser.bind(this));
};

AFKObserver.prototype.refreshUser = function(mumbleUser) {
	if(mumbleUser.session === this.bot.mumble.user.session) {
		return;
	}
	this.times[mumbleUser.session] = Date.now();
	mumbleUser.outputStream(true).on('data', function() {
		var now = Date.now();
		var idleTime = (now - this.times[mumbleUser.session])/1000;
		this.times[mumbleUser.session] = Date.now();
		if(idleTime > this.bot.options.afkWarnTimeout) {
			mumbleUser.sendMessage("AFK Status zurückgesetzt.");
		}
	}.bind(this));
};

module.exports = AFKObserver;

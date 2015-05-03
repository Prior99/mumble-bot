/*
 * Imports
 */
var FS = require('fs');
/*
 * Code
 */
var Music = function(bot) {
	this.fifo = FS.createReadStream(bot.options.mpd.fifo);
	this.fifo.pipe(bot.outputStream());
};

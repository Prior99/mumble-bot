/*
 * Imports
 */

var CachedWebTTS = require('./cachedwebtts');
/*
 * Code
 */

module.exports = function(database) {
	return new CachedWebTTS({
		url : "https://code.responsivevoice.org/getvoice.php?tl=de&sv=&vn=&pitch=0.5&rate=0.5&vol=1&t=",
		cacheDir : "rsponsive-tts-cache",
		splitAfter : 90,
		header : {
			'Host' : "code.responsivevoice.org",
			'Referer' : "http://responsivevoice.org/",
			'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:41.0) Gecko/20100101 Firefox/41.0'
		},
		storeCallback : function(text, callback) {
			database.addCachedTTS('responsive', text, callback);
		},
		retrieveCallback : function(text, callback) {
			database.getCachedTTS('responsive', text, callback);
		}
	});
};

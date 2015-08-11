/*
 * Imports
 */

var CachedWebTTS = require('./cachedwebtts');

/*
 * Code
 */

module.exports = function(database) {
	return new CachedWebTTS({
		url : "http://translate.google.com/translate_tts?tl=de&q=",
		cacheDir : "google-tts-cache",
		splitAfter : 90,
		header : {
			'Host' : "translate.google.com",
			'Referer' : "http://gstatic.com/translate/sound_player.swf",
			'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.82 Safari/537.36'
		},
		storeCallback : function(text, callback) {
			database.addCachedTTS('google', text, callback);
		},
		retrieveCallback : function(text, callback) {
			database.getCachedTTS('google', text, callback);
		}
	});
};
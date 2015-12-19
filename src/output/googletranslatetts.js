import CachedWebTTS from "./cachedwebtts";

/**
 * The Google Translate TTS text to speech api as cached web tts.
 * @param {Database} database - Database to write the cache entries to.
 * @return {undefined}
 */
const GoogleTranslateTTS = function(database) {
	return new CachedWebTTS({
		url : "http://translate.google.com/translate_tts?tl=de&q=",
		cacheDir : "google-tts-cache",
		splitAfter : 90,
		header : {
			"Host" : "translate.google.com",
			"Referer" : "http://gstatic.com/translate/sound_player.swf",
			"User-Agent":
				"Mozilla/5.0 (X11; Linux x86_64) " +
				"AppleWebKit/537.36 (KHTML, like Gecko) " +
				"Chrome/42.0.2311.82 Safari/537.36"
		},
		storeCallback(text, callback) {
			database.addCachedTTS("google", text, callback);
		},
		retrieveCallback(text, callback) {
			database.getCachedTTS("google", text, callback);
		}
	});
};

export default GoogleTranslateTTS;

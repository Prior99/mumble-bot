import CachedWebTTS from "./cachedwebtts";

/**
 * The Google Translate TTS text to speech api as cached web tts.
 * @param {Database} database - Database to write the cache entries to.
 * @return {undefined}
 */
const ResponsiveVoiceTTS = function(database) {
	return new CachedWebTTS({
		url : "https://code.responsivevoice.org/getvoice.php?tl=de&sv=&vn=&pitch=0.5&rate=0.5&vol=1&t=",
		cacheDir : "responsive-tts-cache",
		splitAfter : 90,
		header : {
			"Host" : "code.responsivevoice.org",
			"Referer" : "http://responsivevoice.org/",
			"User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:41.0) Gecko/20100101 Firefox/41.0"
		},
		async storeCallback(text, callback) {
			const filename = await database.addCachedTTS("responsive", text);
			callback(filename);
		},
		async retrieveCallback(text, callback) {
			const filename = await database.getCachedTTS("responsive", text);
			callback(filename);
		}
	});
};

export default ResponsiveVoiceTTS;

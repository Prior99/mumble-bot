import CachedWebTTS from "./cachedwebtts";
import * as Request from "request";
import * as Winston from "winston";

/**
 * Refresh the access token for Bing TTS.
 * @param {string} clientID - The client id with which to login.
 * @param {string} clientSecret - The secret to use for authenticating.
 * @param {callback} callback - Called when the token was refreshed with the parsed body as first argument.
 * @return {undefined}
 */
const getAccessToken = function(clientID, clientSecret, callback) {
	//clientID = encodeURIComponent(clientID);
	//clientSecret = encodeURIComponent(clientSecret);
	Request.post({
		url : "https://datamarket.accesscontrol.windows.net/v2/OAuth2-13",
		form : {
			"grant_type" : "client_credentials",
			"client_id" : clientID,
			"client_secret" : clientSecret,
			"scope" : "http://api.microsofttranslator.com"
		}
	}, (err, http, body) => callback(JSON.parse(body)));
}

/**
 * The Bing TTS text to speech api as cached web tts.
 * @param {string} clientID - The client id with which to login.
 * @param {string} clientSecret - The secret to use for authenticating.
 * @param {Database} database - Database to write the cache entries to.
 * @return {undefined}
 */
const BingTTS = function(clientID, clientSecret, database) {
	const tts = new CachedWebTTS({
		url : "",
		cacheDir : "bing-tts-cache",
		//splitAfter : 90,
		header : { },
		async storeCallback(text, callback) {
			const filename = await database.addCachedTTS("bing_" + tts.gender, text);
			callback(filename);
		},
		async retrieveCallback(text, callback) {
			const filename = await database.getCachedTTS("bing_" + tts.gender, text);
			callback(filename);
		}
	});

	tts.baseUrl = "http://api.microsofttranslator.com/v2/Http.svc/Speak?language=de&format=audio/mp3";
	tts.setGender = function(gender) {
		tts.gender = gender;
		tts.resetURL();
	};
	tts.setAccessToken = function(token) {
		tts.accessToken = token;
		tts.resetURL();
	};
	tts.resetURL = function() {
		tts.url = tts.baseUrl +
			"&options=MaxQuality|" + tts.gender +
			"&appId=Bearer%20" + encodeURIComponent(tts.accessToken) + "&text="
	};

	const refreshAccessToken = function() {
		Winston.info("Refreshing access token for bing tts...");
		getAccessToken(clientID, clientSecret, (response) => {
			tts.header["Authorization"] = "Bearer " + response["access_token"];
			tts.setAccessToken(response["access_token"]);
		});
	}
	refreshAccessToken();
	const millisecondsPerSecond = 1000;
	const secondsPerMinute = 60;
	const nineMinutes = millisecondsPerSecond * secondsPerMinute * 9;
	setInterval(refreshAccessToken, nineMinutes); //Refresh every 9 minutes
	return tts;
};

export default BingTTS;

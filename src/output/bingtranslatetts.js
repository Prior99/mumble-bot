/*
 * Imports
 */

var CachedWebTTS = require('./cachedwebtts');
var Request = require("request");
var Winston = require("winston");

/*
 * Code
 */

function getAccessToken(clientID, clientSecret, callback) {
	//clientID = encodeURIComponent(clientID);
	//clientSecret = encodeURIComponent(clientSecret);
	Request.post({
		url : "https://datamarket.accesscontrol.windows.net/v2/OAuth2-13",
		form : {
			'grant_type' : 'client_credentials',
			'client_id' : clientID,
			'client_secret' : clientSecret,
			'scope' : 'http://api.microsofttranslator.com'
		}
	}, function(err, http, body){
		callback(JSON.parse(body));
	});
}

module.exports = function(clientID, clientSecret, database) {
	var tts = new CachedWebTTS({
		url : "",
		cacheDir : "bing-tts-cache",
		//splitAfter : 90,
		header : { },
		storeCallback : function(text, callback) {
			database.addCachedTTS('bing_' + tts.gender, text, callback);
		}.bind(tts),
		retrieveCallback : function(text, callback) {
			database.getCachedTTS('bing_' + tts.gender, text, callback);
		}.bind(tts)
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
		tts.url = tts.baseUrl + "&options=MaxQuality|" + tts.gender + "&appId=Bearer%20" + encodeURIComponent(tts.accessToken) + "&text="
	};

	function refreshAccessToken() {
		Winston.info("Refreshing access token for bing tts...");
		getAccessToken(clientID, clientSecret, function(response) {
			tts.header['Authorization'] = "Bearer " + response['access_token'];
			tts.setAccessToken(response['access_token']);
		});
	}
	refreshAccessToken();
	setInterval(refreshAccessToken, 1000 * 60 * 9); //Refresh every 9 minutes
	return tts;
};

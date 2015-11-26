var Winston = require("winston");
var Promise = require("promise");

var WebsocketOverview = function(bot) {
	return function(ws, req) {
		var onAdd = function(audio) {
			ws.send(JSON.stringify({
				type : 'add',
				audio : audio
			}));
		};
		var onRemoveAudio = function(audio) {
			ws.send(JSON.stringify({
				type : 'remove',
				id : audio.id
			}));
		};
		var onProtect = function(audio) {
			ws.send(JSON.stringify({
				type : 'protect',
				id : audio.id
			}));
		};
		ws.send(JSON.stringify({
			type : 'init',
			cacheAmount : bot.audioCacheAmount,
			list : bot.cachedAudios
		}));
		bot.on('cached-audio', onAdd);
		bot.on('removed-cached-audio', onRemoveAudio);
		bot.on('protect-cached-audio', onProtect);
		ws.on('close', function() {
			bot.removeListener('cached-audio', onAdd);
			bot.removeListener('removed-cached-audio', onRemoveAudio);
			bot.removeListener('protect-cached-audio', onProtect);
		});
	}
};

module.exports = WebsocketOverview;

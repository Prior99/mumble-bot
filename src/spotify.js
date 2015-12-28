import Spotify from "spotify-web";
import EventEmitter from "events";
import FS from "fs-promise";

class SpotifyWrapper extends EventEmitter {
	constructor(options) {
		super();
		Spotify.login(options.username, options.password, (err, spotify) => this._onLogin(err, spotify));
	}

	_onLogin(err, spotify) {
		this.spotify = spotify;
	}

	_cache(uid) {
		const uri = "spotify:track:" + uid;
		return new Promise((resolve, reject) => {
			this.spotify.get(uri, (err, track) => {
				if(err) {
					reject(err);
				}
				else {
					track.play().pipe("sounds/spotify/" + uid);
					track.on("finish", () => resolve());
				}
			});
		});
	}

	async getCachedMP3ByURL(url) {
		url = url.replace("https", "http");
		const uid = url.substring(30);
		const start = url.substring(0, 30).toLowerCase();
		const filename = "sounds/spotify/" + uid;
		if(start !== "http://play.spotify.com/track/") {
			//TODO
		}
		else {
			try {
				FS.stat(filename);
				return filename;
			}
			catch(err) {
				if(err.code === "ENOENT") {
					await this._cache(uri);
					return filename;
				}
				else {
					//TODO

				}
			}
		}
	}

};

export default SpotifyWrapper;

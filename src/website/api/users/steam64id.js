var Steam64 = require("../../../steam64id.js");

module.exports = function() {
	return function(req, res) {
		Steam64(req.query.steamusername, function(err, steam64id) {
			if(err) {
				res.status(500).send(JSON.stringify({
					okay : false
				}));
			}
			else {
				if(!steam64id) {
					res.status(400).send(JSON.stringify({
						okay : true,
						exists : false
					}));
				}
				else {
					res.status(200).send(JSON.stringify({
						okay : true,
						exists : true,
						id : steam64id
					}));
				}
			}
		});
	}
};

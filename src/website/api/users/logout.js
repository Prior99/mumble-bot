var Winston = require('winston');

module.exports = function() {
	return function(req, res) {
		if(req.session.user) {
			Winston.log('verbose', req.session.user.username + " logged off.");
			req.session.destroy(function(){
				res.send({
					okay : true
				});
			});
		}
		else {
			res.send({
				okay : false,
				reason : "not_logged_in"
			});
		}
	}
}

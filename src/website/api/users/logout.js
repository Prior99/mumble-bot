module.exports = function() {
	return function(req, res) {
		if(req.session.user) {
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

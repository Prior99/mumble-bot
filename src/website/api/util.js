var reply = function(res, code, okay, obj) {
	obj.okay = okay;
	res.status(code).send(obj);
}

module.exports = {
	reply : reply
};

/**
 * Shorthand for replying to a request.
 * @param {object} res - Response object from express that should be answered.
 * @param {number} code - The HTTP status code to respond with.
 * @param {boolean} okay - Whether the request was fulfilled or rejected.
 * @param {object} obj - Object to be sent as answer.
 * @return {undefined}
 */
const reply = function(res, code, okay, obj) {
	obj.okay = okay;
	res.status(code).send(obj);
}

export default reply;

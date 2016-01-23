/**
 * Returns an object representing the get paremeters.
 * Each key of the object returned is a key from the parameters holding the corresponding value.
 * @return {Object} An object representing the get parameters.
 */
export default function() {
	const hash = {};

	location.search.substr(1).split("&").forEach((item) => {
		const kv = item.split("=");
		hash[kv[0]] = decodeURI(kv[1]);
	});

	return hash;
};

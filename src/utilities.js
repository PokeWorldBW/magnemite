module.exports = {
	// Overwrite all previous data
	resetVariables(client) {
		client.userInfo = new Map();
		client.responseCache = new Map();
	},
	// Reads a number and converts it into UTF-16 characters 3 digits at a time
	compress(num) {
		const str = num.toString();
		let ret = '', i, n, s;
		for (i = 0; i < str.length; i += 3) {
			s = str.substring(i, Math.min(i + 3, str.length));
			n = parseInt(s, 10);
			// Add an offset to the number so it doesn't pick up special characters
			// https://en.wikipedia.org/wiki/List_of_Unicode_characters#Control_codes
			ret += String.fromCharCode(n + (n < 95 ? 33 : 67));
		}
		return ret;
	},
};

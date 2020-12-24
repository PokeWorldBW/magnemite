const fs = require('fs');

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
	// Stolen from https://stackoverflow.com/questions/30003353/can-es6-template-literals-be-substituted-at-runtime-or-reused/37217166#37217166
	format(templateString, templateVars) {
		return new Function('return `' + templateString + '`;').call(templateVars);
	},
	// Removes leading [ and trailing ]
	removeBrackets(string) {
		return string.replace(/^\[(.*)\]$/, '$1');
	},
	rand(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	},
	loadData(fileName) {
		return fs.readFileSync(`./data/${fileName}`, 'utf8').split('\r\n').filter(line => line != '');
	},
	combineArgs(args) {
		// Only call removeBrackets if there are more than 1 arg since it would have already been called on the arg by the message handler
		if (Array.isArray(args) && args.length > 0) {
			return args.length > 1 ? this.removeBrackets(args.join(' ')) : args[0];
		} else {
			return null;
		}
	},
};

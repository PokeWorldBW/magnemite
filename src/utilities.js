const fs = require('fs');

class Storage {
	constructor(client, name, message) {
		this.name = name;
		this.line = message;

		if (message.author.id != client.user.id) {
			return;
		}
		const content = message.content;
		const delimiter = content.indexOf(':\n');
		if (name == null) {
			this.name = content.substring(0, delimiter);
		}
		// Remove first and last 3 characters because they will be ```
		this.data = JSON.parse(content.substring(delimiter + 5, content.length - 3));
	}

	has(key) {
		return Object.prototype.hasOwnProperty.call(this.data, key);
	}

	get(key) {
		if (this.has(key)) {
			return this.data[key];
		} else {
			return null;
		}
	}

	async save() {
		const json = JSON.stringify(this.data);
		const record = `${this.name}:\n\`\`\`${json}\`\`\``;
		await this.line.edit(record);
	}

	add(key, value) {
		this.data[key] = value;
		this.save();
	}

	remove(key) {
		if (this.has(key)) {
			const temp = this.get(key);
			delete this.data[key];
			this.save();
			return temp;
		}
	}

	keys() {
		return Object.keys(this.data);
	}

	clear() {
		this.data = {};
		this.save();
	}
}

module.exports = {
	Storage,
	// Creates a storage object if one hasn't already been created for the name
	async buildStorage(client, channel, name) {
		const record = `${name}:\n\`\`\`{}\`\`\``;
		let message;
		await channel.send(record).then(m => { message = m; })
			.catch(error => { console.error(`Error in Utilities.buildStorage: ${error}`); });
		return new Storage(client, name, message);
	},
	// Overwrite all previous data
	resetVariables(client) {
		client.userInfo = new Map();
		client.responseCache = new Map();

		// Remove old announcements
		if (client.data.has('ANNOUNCEMENTS')) {
			const storage = client.data.get('ANNOUNCEMENTS');
			if (storage.has('announcements')) {
				const announcements = storage.get('announcements');
				const now = (new Date()).getTime();
				const newAnnouncements = announcements.filter(announcement => announcement.timeToSend > now);
				if (announcements.length != newAnnouncements.length) {
					storage.add('announcements', newAnnouncements);
				}
			}
		}
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
	// Gets a random number between min and max
	rand(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	},
	// Loads data from a file and returns an array where each element is a line in the file
	loadDataFromFile(fileName) {
		return fs.readFileSync(`./data/${fileName}`, 'utf8').split(/\r?\n/).filter(line => line != '');
	},
	// Ignores remaining spaces and joins all the args together
	combineArgs(args) {
		// Only call removeBrackets if there are more than 1 arg since it would have already been called on the arg by the message handler
		if (Array.isArray(args) && args.length > 0) {
			return args.length > 1 ? this.removeBrackets(args.join(' ')) : args[0];
		} else {
			return null;
		}
	},
	// Returns whether the userId is the owner
	isOwner(client, userId) {
		return client.bot.config.ownerId == userId;
	},
	// Sends a message to a channel
	sendMessage(channel, message) {
		channel.send(message).catch(error => { console.error(`Error sending message: ${error}`); });
	},
};

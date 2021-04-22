const fs = require('fs');

const EMOJI_REGEX = /<a?:.+?:(\d+)>/g;

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
		return true;
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

	getRawData() {
		return this.data;
	}

	setRawData(obj) {
		this.data = obj;
		this.save();
		return true;
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
				if (announcements.length > 0) {
					const now = (new Date()).getTime();
					const pendingAnnouncements = [];
					for (let i = 0; i < announcements.length; i++) {
						const announcement = announcements[i];
						const { timeToSend, id } = announcement;
						if (timeToSend > now) {
							pendingAnnouncements.push(announcement);
						} else if (client.announcements.timeouts.has(id)) {
							client.announcements.timeouts.delete(id);
						}
					}
					if (announcements.length != pendingAnnouncements.length) {
						storage.add('announcements', pendingAnnouncements);
					}
				}
			}
		}
	},
	// Reads a number and converts it into UTF-16 characters 3 digits at a time
	// Useful to shorten large numbers like IDs for readbility/avoiding character limits
	compress(num) {
		const str = num.toString();
		let ret = '', i, n, s;
		for (i = 0; i < str.length; i += 3) {
			s = Math.min(i + 3, str.length);
			n = parseInt(str.substring(i, s), 10);
			// Add an offset to the number so it doesn't pick up special characters
			// https://en.wikipedia.org/wiki/List_of_Unicode_characters#Control_codes
			ret += String.fromCharCode(n + (n < 94 ? 33 : 67));
			// String length is not multiple of 3, so it cuts abruptly
			// Add a placeholder so when this is decompressed, it can detect and know not to pad with leading zeroes
			if (s < i + 3) {
				ret += String.fromCharCode(1066 + s - i);
				// s - i is effectively str.length % 3
			}
		}
		return ret;
	},
	// Reverses the compress function; turns the compressed string back into the full number
	decompress(str) {
		let ret = '', i, n, m;
		for (i = 0; i < str.length; i++) {
			n = str.charCodeAt(i);
			m = n - (n > 160 ? 67 : 33);
			if (i == str.length - 2 && str.charCodeAt(i + 1) > 1066) {
				const t = str.charCodeAt(i + 1);
				if (t == 1067) {
					// This should only be 1 character long, don't pad with leading zeroes
					ret += m;
				} else {
					// This should be exactly 2 characters long, pad with leading zeroes only if it is a single digit
					ret += m < 10 ? '0' + m : m;
				}
				break;
			} else {
				// Pad with leading zeroes to make the length 3
				ret += m < 10 ? '00' + m : (m < 100 ? '0' + m : m);
			}
		}
		return ret;
	},
	// Stolen from https://stackoverflow.com/questions/30003353/can-es6-template-literals-be-substituted-at-runtime-or-reused/37217166#37217166
	format(templateString, templateVars) {
		return new Function('return `' + templateString.replace(/`/g, '\\`') + '`;').call(templateVars);
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
	// Returns whether the server (guild) is the main server
	isMainServer(client, guildId) {
		return client.bot.config.mainServer == guildId;
	},
	// Sends a message to a channel
	sendMessage(channel, message, client) {
		channel.send(message).catch(error => { this.handleError(client, 'sending message', error); });
	},
	// Converts a given number of seconds into a readable string
	getTimeString(seconds) {
		if (isNaN(seconds)) {
			return null;
		}
		const timeIntervals = [['week', 7 * 24 * 60 * 60], ['day', 24 * 60 * 60], ['hour', 60 * 60], ['minute', 60]];
		const timeString = [];
		let num, interval, intervalName;
		for (let i = 0; i < timeIntervals.length; i++) {
			interval = timeIntervals[i];
			num = parseInt(seconds / interval[1], 10);
			if (num > 0) {
				intervalName = interval[0] + (num > 1 ? 's' : '');
				timeString.push(`${num} ${intervalName}`);
				seconds -= num * interval[1];
			}
		}
		if (timeString.length < 2 && seconds > 0) {
			intervalName = 'second' + (seconds > 1 ? 's' : '');
			timeString.push(`${seconds} ${intervalName}`);
		}
		return timeString.join(', ');
	},
	// Parses unique emoji ids from a string and returns them in an array
	getEmojiIds(str) {
		if (typeof str != 'string') {
			return null;
		} else {
			// Use a set to prevent duplicates
			const emojiIds = new Set();
			const matches = str.matchAll(EMOJI_REGEX);
			for (const match of matches) {
				emojiIds.add(match[1]);
			}
			return [...emojiIds.values()];
		}
	},
	// Handles errors caught when sending messages and stuff
	handleError(client, action, error) {
		const errorMessage = `Error with \`${action}\`: ${error}`;
		console.error(errorMessage);
		client.channels.cache.get(client.bot.config.debugChannel).send(errorMessage)
			.catch(err => { console.error(`Error with sending debug message: ${err}`); });
	},
	// Handles errors caught when sending messages for commands and stuff
	handleCommandError(client, message, command, error) {
		const errorMessage = `Error with \`${command}\` command used by \`${message.author.tag}\` in \`${message.guild.name}\`#\`${message.channel.name}\`:\n\`\`\`\n${message.cleanContent}\n\`\`\`\`\`\`\n${error}\n\`\`\``;
		console.error(errorMessage);
		client.channels.cache.get(client.bot.config.debugChannel).send(errorMessage)
			.catch(err => { console.error(`Error with sending debug message: ${err}`); });
	},
};

const Discord = require('discord.js');
const fs = require('fs');
const { prefix, version, avatars, dataStorage, resetVarInterval, timeZone } = require('../settings.json');
const moment = require('moment-timezone');
const Utilities = require('./utilities.js');

let config, credentials;
if (process.env._ == '/app/.heroku/node/bin/npm') {
	// Use Heroku Config Vars when running on Heroku
	config = {
		randomColorRole: process.env.RANDOM_COLOR_ROLE,
		debugChannel: process.env.DEBUG_CHANNEL,
		dataChannel: process.env.DATA_CHANNEL,
		logChannel: process.env.LOG_CHANNEL,
		ownerId: process.env.OWNER_ID,
		blocklistRole: process.env.BLOCKED_ROLES,
		mainServer: process.env.MAIN_SERVER,
		emojiReportChannel: process.env.EMOJI_REPORT_CHANNEL,
	};
	credentials = {
		discord_token: process.env.TOKEN,
	};
} else {
	config = require('../config.json');
	credentials = require('../credentials.json');
}

// Create a new Discord client
const client = new Discord.Client();

client.bot = {
	settings: {
		prefix: prefix,
		version: version,
		avatars: avatars,
		timeZone: timeZone,
	},
	config: config,
	shuttingDown: false,
	uptime: 0,
};

client.plugins = new Discord.Collection();
client.commands = new Discord.Collection();
// For some reason, fs and require are in different "working directories"
const pluginFiles = fs.readdirSync('./src/commands/').filter(file => file.endsWith('.js'));
for (const file of pluginFiles) {
	const plugin = require(`./commands/${file}`);
	const pluginCommands = new Discord.Collection();
	client.plugins.set(plugin.name, pluginCommands);

	for (let i = 0; i < plugin.commands.length; i++) {
		const command = plugin.commands[i];
		pluginCommands.set(command.name, command);
		client.commands.set(command.name, { pluginName: plugin.name, commandName: command.name });

		if (Array.isArray(command.aliases) && command.aliases.length > 0) {
			for (let j = 0; j < command.aliases.length; j++) {
				client.commands.set(command.aliases[j], { pluginName: plugin.name, commandName: command.name });
			}
		}
	}
}

client.userInfo = new Map();
client.responseCache = new Map();
client.data = new Map();
client.sessions = new Map();
client.eventListeners = new Map();

client.announcements = {
	timeouts: new Map(),
	lastId: 0,
};

/* client.cooldowns = {
	users: new Map(),
	channels: new Map(),
	// servers: new Map(),
}; */

const ColorHash = require('color-hash');
const colorHash = new ColorHash();

function changeRandomColorRole(color, serverId, roleId) {
	client.guilds.fetch(serverId)
		.then(guild => {
			guild.roles.fetch(roleId)
				.then(role => {
					if (role.hexColor !== color) {
						role.setColor(color);
					}
				})
				.catch(error => { console.error(`Error with fetching role ${roleId} in changeRandomColorRole: ${error}`); });
		})
		.catch(error => { console.error(`Error with fetching server ${serverId} in changeRandomColorRole: ${error}`); });
}

function runDailyChecks() {
	console.log('running daily check');
	const time = moment().tz(timeZone);
	const color = colorHash.hex(time.format('MM DD YYYY'));
	changeRandomColorRole(color, config.mainServer, config.randomColorRole);
	if (time.date() == 1) {
		if (client.data.has('CURRENT_MONTH_REACTIONS') && client.data.has('LAST_MONTH_REACTIONS')) {
			const currentMonthReactions = client.data.get('CURRENT_MONTH_REACTIONS');
			const lastMonthReactions = client.data.get('LAST_MONTH_REACTIONS');
			lastMonthReactions.setRawData(currentMonthReactions.getRawData());
			currentMonthReactions.clear();
			if (client.commands.has('emojiusage')) {
				const { pluginName, commandName } = client.commands.get('emojiusage');
				client.channels.cache.get(config.emojiReportChannel).messages.fetch({ limit: 1 }).then(messages => {
					if (messages.size > 0) {
						client.plugins.get(pluginName).get(commandName).execute(messages.first(), ['last'], client, null);
					} else {
						console.log('Failed to get a message from the emojiReportChannel, so couldn\'t print monthly emojiusage stats');
					}
				});
			}
		}
	}
}

function startDailyChecks() {
	// 86400000 ms in a day
	setInterval(runDailyChecks, 86400000);
	runDailyChecks();
}

// Stolen from https://stackoverflow.com/questions/17581830/load-node-js-module-from-string-in-memory/17585470#17585470
function requireFromString(src) {
	const Module = module.constructor;
	const m = new Module();
	m._compile(src, '');
	return m.exports;
}

// When the client is ready, run this code
// This event will only trigger one time after logging in
client.once('ready', () => {
	console.log('Ready!');

	client.bot.uptime = (new Date()).getTime();

	// client.user.setPresence({ activity: { name: status } });

	setInterval(Utilities.resetVariables, resetVarInterval, client);

	const time = moment().tz(timeZone);
	const nextDay = moment().tz(timeZone).startOf('day').day(time.days() + 1);
	console.log(time);
	console.log(nextDay);
	console.log(nextDay.valueOf() - time.valueOf());
	setTimeout(startDailyChecks, nextDay.valueOf() - time.valueOf());

	client.channels.cache.get(config.dataChannel).messages.fetch()
		.then(messages => {
			messages.forEach(message => {
				const delimiter = message.content.indexOf(':\n');
				const name = message.content.substring(0, delimiter);
				if (name == 'ADDITIONAL_EVENTS') {
					const eventListeners = requireFromString(message.content.substring(delimiter + 16, message.content.length - 4)).eventListeners;
					for (let i = 0; i < eventListeners.length; i++) {
						const listener = eventListeners[i];
						client.eventListeners.set(listener.event, listener.listen);
					}
				} else {
					const storage = new Utilities.Storage(client, name, message);
					client.data.set(storage.name, storage);

					if (storage.name == 'ANNOUNCEMENTS') {
						if (storage.has('announcements')) {
							const announcements = storage.get('announcements');
							const pendingAnnouncements = [];
							const now = (new Date()).getTime();
							for (let i = 0; i < announcements.length; i++) {
								const announcement = announcements[i];
								const { channelId, timeToSend, messageToSend } = announcement;
								const channelToSend = client.channels.cache.get(channelId);
								if (timeToSend >= now) {
									const id = ++client.announcements.lastId;
									announcement.id = id;
									client.announcements.timeouts.set(id, setTimeout(Utilities.sendMessage, timeToSend - now, channelToSend, messageToSend));
									pendingAnnouncements.push(announcement);
								}
							}
							if (pendingAnnouncements.length != announcements.length) {
								// Overwrite announcement data
								storage.add('announcements', pendingAnnouncements);
							}
						}
					}
				}
			});
			for (let i = 0; i < dataStorage.length; i++) {
				const s = dataStorage[i];
				if (!client.data.has(s)) {
					Utilities.buildStorage(client, client.channels.cache.get(config.dataChannel), s).then(storage => {
						client.data.set(storage.name, storage);
					});
				}
			}
		})
		.catch(error => { console.error(`Error with setting up data storage: ${error}`); });
});

client.on('message', message => {
	// Add to reaction tracking data if the message is from the main server
	if (Utilities.isMainServer(client, message.guild.id) && client.user.id != message.author.id && client.data.has('CURRENT_MONTH_REACTIONS')) {
		const emojiIds = Utilities.getEmojiIds(message.content);
		if (emojiIds.length > 0) {
			const storage = client.data.get('CURRENT_MONTH_REACTIONS');
			emojiIds.forEach(emojiId => {
				const compressedId = Utilities.compress(emojiId);
				if (storage.has(compressedId)) {
					const count = storage.get(compressedId);
					storage.add(compressedId, count + 1);
				} else {
					storage.add(compressedId, 1);
				}
			});
		}
	}

	let args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();

	// Remove wrapping [ and ] from args
	args = args.map(arg => Utilities.removeBrackets(arg));

	if (!message.author.bot && message.content.startsWith(prefix)) {
		if (!Utilities.isOwner(client, message.author.id) && message.member.roles.cache.has(config.blocklistRole)) {
			// Don't let this member use any commands
			return;
		}

		// Execute if it is a command
		if (client.commands.has(command)) {
			try {
				const { pluginName, commandName } = client.commands.get(command);
				if (pluginName == 'owner' && !Utilities.isOwner(client, message.author.id)) {
					return;
				}
				if (pluginName == 'special' && !Utilities.isMainServer(client, message.guild.id)) {
					return;
				}
				const props = { command: commandName, prefix: prefix };
				client.plugins.get(pluginName).get(commandName).execute(message, args, client, props);
			} catch (error) {
				const errorMessage = `Error with \`${command}\` command used by \`${message.author.tag}\` in \`${message.guild.name}\`#\`${message.channel.name}\`:\n\`\`\`\n${message.cleanContent}\n\`\`\`\n\`\`\`\n${error}\n\`\`\``;
				console.error(errorMessage);
				client.channels.cache.get(config.debugChannel).send(errorMessage).catch(err => { console.error(`Error with sending debug message: ${err}`); });
				message.reply('there was an error trying to execute that command!');
			}
		}
	}

	// Log DMs in case people are privately abusing the bot
	if (message.channel.type == 'dm' && message.author.id != client.user.id) {
		const content = message.content.length > 0 ? `\`\`\`\n${message.content}\`\`\`` : '';
		const attachments = message.attachments.map(a => `<${a.proxyURL}>`).join('\n');
		const attachMessage = attachments.length > 0 ? `\`Attachments:\`\n${attachments}` : '';
		client.channels.cache.get(config.logChannel).send(`Direct Message from \`${message.author.tag}\`:\n${content}${attachMessage}`)
			.catch(error => { console.error(`Error with logging DM: ${error}`); });
	}

	if (client.eventListeners.has('message')) {
		const listener = client.eventListeners.get('message');
		const response = listener(message);
		if (response != null) {
			client.channels.cache.get(config.logChannel).send(response)
				.catch(error => { console.error(`Error with sending message in '${listener.event}' event listener: ${error}`); });
		}
	}
});

client.on('messageReactionAdd', messageReaction => {
	const { emoji, message } = messageReaction;
	// Only track custom emojis which shouldn't have a null id
	if (Utilities.isMainServer(client, message.guild.id) && emoji.id != null) {
		if (client.data.has('CURRENT_MONTH_REACTIONS')) {
			const storage = client.data.get('CURRENT_MONTH_REACTIONS');
			const compressedId = Utilities.compress(emoji.id);
			if (storage.has(compressedId)) {
				const count = storage.get(compressedId);
				storage.add(compressedId, count + 1);
			} else {
				storage.add(compressedId, 1);
			}
		}
	}

	if (client.eventListeners.has('messageReactionAdd')) {
		const listener = client.eventListeners.get('messageReactionAdd');
		const response = listener(message);
		if (response != null) {
			client.channels.cache.get(config.logChannel).send(response)
				.catch(error => { console.error(`Error with sending message in '${listener.event}' event listener: ${error}`); });
		}
	}
});

client.on('messageReactionRemove', messageReaction => {
	const { emoji, message } = messageReaction;
	// Only track custom emojis which shouldn't have a null id
	if (Utilities.isMainServer(client, message.guild.id) && emoji.id != null) {
		if (client.data.has('CURRENT_MONTH_REACTIONS')) {
			const storage = client.data.get('CURRENT_MONTH_REACTIONS');
			const compressedId = Utilities.compress(emoji.id);
			if (storage.has(compressedId)) {
				const count = storage.get(compressedId);
				if (count > 0) {
					storage.add(compressedId, count - 1);
				}
			}
		}
	}

	if (client.eventListeners.has('messageReactionRemove')) {
		const listener = client.eventListeners.get('messageReactionRemove');
		const response = listener(message);
		if (response != null) {
			client.channels.cache.get(config.logChannel).send(response)
				.catch(error => { console.error(`Error with sending message in '${listener.event}' event listener: ${error}`); });
		}
	}
});

client.on('messageDelete', message => {
	// Subtract from reaction tracking data if the message is from the main server
	if (Utilities.isMainServer(client, message.guild.id) && client.user.id != message.author.id && client.data.has('CURRENT_MONTH_REACTIONS')) {
		const emojiIds = Utilities.getEmojiIds(message.content);
		if (emojiIds.length > 0) {
			const storage = client.data.get('CURRENT_MONTH_REACTIONS');
			emojiIds.forEach(emojiId => {
				const compressedId = Utilities.compress(emojiId);
				if (storage.has(compressedId)) {
					const count = storage.get(compressedId);
					if (count > 0) {
						storage.add(compressedId, count - 1);
					}
				}
			});
		}
	}

	if (client.eventListeners.has('messageDelete')) {
		const listener = client.eventListeners.get('messageDelete');
		const response = listener(message);
		if (response != null) {
			client.channels.cache.get(config.logChannel).send(response)
				.catch(error => { console.error(`Error with sending message in '${listener.event}' event listener: ${error}`); });
		}
	}
});

client.on('messageUpdate', (oldMessage, newMessage) => {
	// Add to reaction tracking data if the message is from the main server
	if (Utilities.isMainServer(client, oldMessage.guild.id)
		&& client.user.id != oldMessage.author.id
		&& oldMessage.content != newMessage.content
		&& client.data.has('CURRENT_MONTH_REACTIONS')) {
		const oldEmojiIds = Utilities.getEmojiIds(oldMessage.content);
		const newEmojiIds = Utilities.getEmojiIds(newMessage.content);
		if (oldEmojiIds.length > 0 || newEmojiIds.length > 0) {
			const storage = client.data.get('CURRENT_MONTH_REACTIONS');
			let emojiId;
			const newEmojiSet = new Set(newEmojiIds);
			for (let i = 0; i < oldEmojiIds.length; i++) {
				emojiId = oldEmojiIds[i];
				if (!newEmojiSet.has(emojiId)) {
					const compressedId = Utilities.compress(emojiId);
					if (storage.has(compressedId)) {
						const count = storage.get(compressedId);
						if (count > 0) {
							storage.add(compressedId, count - 1);
						}
					}
				}
			}
			const oldEmojiSet = new Set(oldEmojiIds);
			for (let j = 0; j < newEmojiIds.length; j++) {
				emojiId = newEmojiIds[j];
				if (!oldEmojiSet.has(emojiId)) {
					const compressedId = Utilities.compress(emojiId);
					if (storage.has(compressedId)) {
						const count = storage.get(compressedId);
						storage.add(compressedId, count + 1);
					} else {
						storage.add(compressedId, 1);
					}
				}
			}
		}
	}

	if (client.eventListeners.has('messageUpdate')) {
		const listener = client.eventListeners.get('messageUpdate');
		const response = listener(oldMessage, newMessage);
		if (response != null) {
			client.channels.cache.get(config.logChannel).send(response)
				.catch(error => { console.error(`Error with sending message in '${listener.event}' event listener: ${error}`); });
		}
	}
});

// Login to Discord with the app's token
client.login(credentials.discord_token);

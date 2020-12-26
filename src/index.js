const Discord = require('discord.js');
const fs = require('fs');
const { prefix, version, avatars, dataStorage, resetVarInterval } = require('../settings.json');
const Utilities = require('./utilities.js');

let config, credentials;
if (process.env._ == '/app/.heroku/node/bin/npm') {
	// Use Heroku Config Vars when running on Heroku
	config = {
		randomColorGuilds: process.env.RANDOM_COLOR_GUILDS.split('|'),
		randomColorRoles: process.env.RANDOM_COLOR_ROLES.split('|'),
		debugChannel: process.env.DEBUG_CHANNEL,
		dataChannel: process.env.DATA_CHANNEL,
		logChannel: process.env.LOG_CHANNEL,
		ownerId: process.env.OWNER_ID,
		blockedRoles: process.env.BLOCKED_ROLES.split('|'),
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

function updateRandomColorRoles() {
	const color = colorHash.hex((new Date()).toLocaleDateString());
	for (let i = 0; i < config.randomColorGuilds.length; i++) {
		changeRandomColorRole(color, config.randomColorGuilds[i], config.randomColorRoles[i]);
	}
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

	// Check every hour
	setInterval(updateRandomColorRoles, 3600000);

	client.channels.cache.get(config.dataChannel).messages.fetch()
		.then(messages => {
			messages.forEach(message => {
				const delimiter = message.content.indexOf(':\n');
				const name = message.content.substring(0, delimiter);
				if (name == 'ADDITIONAL_EVENTS') {
					const eventListeners = requireFromString(message.content.substring(delimiter + 16, message.content.length - 4)).eventListeners;
					for (let i = 0; i < eventListeners.length; i++) {
						const listener = eventListeners[i];
						client.on(listener.event, (...args) => {
							const response = listener.listen(...args);
							if (response != null) {
								client.channels.cache.get(config.logChannel).send(response)
									.catch(error => { console.error(`Error with sending message in '${listener.event}' event listener: ${error}`); });
							}
						});
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
	let args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();

	// Remove wrapping [ and ] from args
	args = args.map(arg => Utilities.removeBrackets(arg));

	if (!message.author.bot && message.content.startsWith(prefix)) {
		if (!Utilities.isOwner(client, message.author.id)) {
			for (let i = 0; i < config.blockedRoles.length; i++) {
				if (message.member.roles.cache.has(config.blockedRoles[i])) {
					// Don't let this member use any commands
					return;
				}
			}
		}
		if (client.commands.has(command)) {
			try {
				const { pluginName, commandName } = client.commands.get(command);
				if (pluginName == 'owner' && !Utilities.isOwner(client, message.author.id)) {
					return;
				}
				const props = { command: commandName, prefix: prefix };
				client.plugins.get(pluginName).get(commandName).execute(message, args, client, props);
			} catch (error) {
				const errorMessage = `Error with \`${command}\` command used by \`${message.author.tag}\` in \`${message.guild.name}\`#\`${message.channel.name}\`:\n\`\`\`\n${message.cleanContent}\n\`\`\`\`\`\`\n${error}\n\`\`\``;
				console.error(errorMessage);
				client.channels.cache.get(config.debugChannel).send(errorMessage).catch(err => { console.error(`Error with sending debug message: ${err}`); });
				message.reply('there was an error trying to execute that command!');
			}
		}
	}
	// Log DMs in case people are privately abusing the bot
	if (message.channel.type == 'dm' && message.author.id != client.user.id) {
		const content = message.content.length > 0 ? `\`\`\`\n${message.content}\`\`\`` : '';
		const attachments = message.attachments.map(a => `<${a.attachment}>`).join('\n');
		const attachMessage = attachments.length > 0 ? `\`Attachments:\`\n${attachments}` : '';
		client.channels.cache.get(config.logChannel).send(`Direct Message from \`${message.author.tag}\`:\n${content}${attachMessage}`)
			.catch(error => { console.error(`Error with logging DM: ${error}`); });
	}
});

// Login to Discord with the app's token
client.login(credentials.discord_token);

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
		evalMessage: process.env.EVAL_MESSAGE,
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

client.cooldowns = {
	users: new Map(),
	channels: new Map(),
	// servers: new Map(),
};

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
				.catch(console.error);
		})
		.catch(console.error);
}

function updateRandomColorRoles() {
	const color = colorHash.hex((new Date()).toLocaleDateString());
	for (let i = 0; i < config.randomColorGuilds.length; i++) {
		changeRandomColorRole(color, config.randomColorGuilds[i], config.randomColorRoles[i]);
	}
}

// When the client is ready, run this code
// This event will only trigger one time after logging in
client.once('ready', () => {
	console.log('Ready!');

	// client.user.setPresence({ activity: { name: status } });

	setInterval(Utilities.resetVariables, resetVarInterval, client);

	// Check every hour
	setInterval(updateRandomColorRoles, 3600000);

	client.channels.cache.get(config.dataChannel).messages.fetch()
		.then(messages => {
			messages.forEach(message => {
				if (message.id == config.evalMessage) {
					eval(message.content.substring(14, message.content.length - 4));
				} else {
					const storage = new Utilities.Storage(client, null, message);
					client.data.set(storage.name, storage);

					if (storage.name == 'ANNOUNCEMENTS') {
						if (storage.has('announcements')) {
							const announcements = storage.get('announcements');
							const now = (new Date()).getTime();
							for (let i = 0; i < announcements.length; i++) {
								const { channelId, timeToSend, messageToSend } = announcements[i];
								const channelToSend = client.channels.cache.get(channelId);
								if (timeToSend >= now) {
									setTimeout(Utilities.sendMessage, timeToSend - now, channelToSend, messageToSend);
								}
							}
						}
					}
				}
			});
		})
		.then(() => {
			for (let i = 0; i < dataStorage.length; i++) {
				const s = dataStorage[i];
				if (!client.data.has(s)) {
					Utilities.buildStorage(client, client.channels.cache.get(config.dataChannel), s).then(storage => {
						client.data.set(storage.name, storage);
					});
				}
			}
		})
		.catch(console.error);
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
				console.error(error);
				const errorMessage = `Error with \`${command}\` command used by \`${message.author.tag}\` in \`${message.guild.name}\`#\`${message.channel.name}\`:\n\`\`\`\n${message.cleanContent}\n\`\`\`\`\`\`\n${error}\n\`\`\``;
				client.channels.cache.get(config.debugChannel).send(errorMessage);
				message.reply('there was an error trying to execute that command!');
			}
		}
	}
	// Log DMs in case people are privately abusing the bot
	if (message.channel.type == 'dm') {
		const content = message.content.length > 0 ? `\`\`\`\n${message.content}\`\`\`` : '';
		const attachments = message.attachments.map(a => `<${a.attachment}>`).join('\n');
		const attachMessage = attachments.length > 0 ? `\`Attachments:\`\n${attachments}` : '';
		client.channels.cache.get(config.logChannel).send(`Direct Message from \`${message.author.tag}\`:\n${content}${attachMessage}`);
	}
});

// Login to Discord with the app's token
client.login(credentials.discord_token);

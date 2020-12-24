const { prefix, version } = require('../settings.json');

let config, credentials;
if (process.env._ == '/app/.heroku/node/bin/npm') {
	// Use Heroku Config Vars when running on Heroku
	config = {
		randomColorGuilds: process.env.RANDOM_COLOR_GUILDS.split('|'),
		randomColorRoles: process.env.RANDOM_COLOR_ROLES.split('|'),
	};
	credentials = {
		discord_token: process.env.TOKEN,
	};
} else {
	config = require('../config.json');
	credentials = require('../credentials.json');
}

/* Reminder that it is possible to use Maps, so don't use objects where maps are appropriate*/

// Require the discord.js module
const Discord = require('discord.js');

// Create a new Discord client
const client = new Discord.Client();

const ColorHash = require('color-hash');
const colorHash = new ColorHash();

let userinfo = {};

// User for per person role names
// Reads a number and converts it into UTF-16 characters 3 digits at a time
/* function compress(num) {
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
}*/

function resetVariables() {
	userinfo = {};
}

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
	// Reset variables every 10 minutes
	setInterval(resetVariables, 600000);
	// Check every hour
	setInterval(updateRandomColorRoles, 3600000);
});

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();
	// console.log(command);
	const { content, guild, channel } = message;
	// console.log(content);
	if (content === `${prefix}server`) {
		channel.send(`Server name: ${guild.name}
Owner: ${guild.owner.user.username}
Total members: ${guild.memberCount}
Creation Time: ${guild.createdAt}
Region: ${guild.region}
Id: ${guild.id}`);
	} else if (message.content === `${prefix}user-info`) {
		message.channel.send(`Username: ${message.author.username}
Id: ${message.author.id}
Account Creation Time: ${message.author.createdAt}`);
	} else if (command === 'avatar') {
		// or icon or pfp
		if (!message.mentions.users.size) {
			return message.channel.send(`Your avatar: <${message.author.displayAvatarURL({ format: 'png', dynamic: true })}>`);
		}

		const avatarList = message.mentions.users.map(user => {
			return `${user.username}'s avatar: <${user.displayAvatarURL({ format: 'png', dynamic: true })}>`;
		});

		// send the entire array of strings as a message
		// by default, discord.js will `.join()` the array with `\n`
		message.channel.send(avatarList);
	} else if (command === 'version') {
		channel.send(`Version: ${version}`);
	} else if (command === 'iq') {
		const userID = message.author.id;
		if (!Object.prototype.hasOwnProperty.call(userinfo, userID)) {
			userinfo[userID] = {};
		}
		if (!Object.prototype.hasOwnProperty.call(userinfo[userID], 'iq')) {
			// adapted from https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
			const u1 = Math.random(), u2 = Math.random(), trig = Math.random() < 0.5 ? Math.cos : Math.sin;
			const z = Math.sqrt(-2 * Math.log(u1)) * trig(2 * Math.PI * u2);
			let iq = z * 15 + 100;
			if (channel.name === 'power-plant') {
				// Increase IQ (if less than 144)
				iq = Math.sqrt(iq) * (12 + Math.random());
			}
			// Decrease IQ
			// if (false) { iq = Math.floor((iq - Math.pow(Math.random() * 10 + Math.random(), Math.random() + 1)) * 10) / 10; }
			/* if (userID === client.id) {
				iq *= Math.floor(Math.pow(10, 1 + Math.random())) / 10;
			}*/
			userinfo[userID].iq = iq;
		}
		channel.send(`<@${userID}>'s IQ is ${userinfo[userID].iq.toFixed(1)}.`);
	}

	// const command = client.commands.get(commandName)		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	// message.reply responds to user with mention
});

// Login to Discord with the app's token
client.login(credentials.discord_token);

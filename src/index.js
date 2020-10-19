const { token } = require('../token.json');
const { prefix } = require('../config.json');

// console.log(require('../token.json'));
console.log(process.env._);

/* Reminder that it is possible to use Maps, so don't use objects where maps are appropriate*/

// Require the discord.js module
const Discord = require('discord.js');

// Create a new Discord client
const client = new Discord.Client();

// When the client is ready, run this code
// This event will only trigger one time after logging in
client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();
	console.log(command);
	const { content, guild, channel } = message;
	console.log(content);
	if (content === `${prefix}server`) {
		channel.send(`Server name: ${guild.name}
Total members: ${guild.memberCount}
Creation time: ${guild.createdAt}
Description: ${guild.description}
Id: ${guild.id}
Joined At: ${message.author.createdAt}
Owner: ${guild.owner.user.username}
Region: ${guild.region}
Shard: ${guild.shard.id}`);
	} else if (message.content === `${prefix}user-info`) {
		message.channel.send(`Your username: ${message.author.username}\nYour ID: ${message.author.id}`);
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
	}

	// const command = client.commands.get(commandName)		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	// message.reply responds to user with mention
});

// Login to Discord with your app's token
client.login(token);

const Utilities = require('../utilities.js');

module.exports = {
	name: 'info',
	commands: [
		{
			name: 'version',
			description: 'Displays the bot version',
			help: 'Type `${this.prefix}${this.command}`',
			execute(message, args, client, props) {
				message.channel.send(`Current version is: \`${client.bot.settings.version}\``)
					.catch(error => Utilities.handleCommandError(client, message, props.command, error));
			},
		},
		{
			name: 'uptime',
			description: 'Shows how long the bot has been running',
			help: 'Type `${this.prefix}${this.command}`',
			execute(message, args, client, props) {
				const now = (new Date()).getTime();
				const uptime = Utilities.getTimeString(Math.floor((now - client.bot.uptime) / 1000));
				message.channel.send(`Current uptime: \`${uptime}\``)
					.catch(error => Utilities.handleCommandError(client, message, props.command, error));
			},
		},
		{
			name: 'info',
			description: 'Shows information about the server or the user',
			help: 'Type `${this.prefix}${this.command} server` or `${this.prefix}${this.command} user` to see information about the server or yourself\nThis cannot be used on other users',
			execute(message, args, client, props) {
				if (args.length == 0) {
					return message.channel.send(Utilities.format(this.help, props))
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				}
				const data = args[0].toLowerCase();
				switch (data) {
				case 'server':
					message.channel.send(`\`\`\`\nName: ${message.guild.name}\nId: ${message.guild.id}\nOwner: ${message.guild.owner.user.tag}\nTotal Members: ${message.guild.memberCount}\nCreation Time: ${message.guild.createdAt}\nRegion: ${message.guild.region}\n\`\`\``)
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
					break;
				case 'user':
					message.channel.send(`\`\`\`\nTag: ${message.author.tag}\nId: ${message.author.id}\nAccount Creation Time: ${message.author.createdAt}\n\`\`\``)
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
					break;
				default:
					message.reply(`I can only get info on the server or users! Please use \`${client.bot.settings.prefix}info server\` or \`${client.bot.settings.prefix}info user\``)
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				}
			},
		},
	],
};

module.exports = {
	name: 'misc',
	commands: [
		{
			name: 'version',
			description: '',
			help: 'dong!',
			execute(message, args, client) {
				message.channel.send(`Current version is: \`${client.bot.settings.version}\``);
			},
		},
		{
			name: 'info',
			description: '',
			help: '',
			execute(message, args, client) {
				const data = args[0].toLowerCase();
				switch (data) {
				case 'server':
					message.channel.send(`\`\`\`\nName: ${message.guild.name}\nId: ${message.guild.id}\nOwner: ${message.guild.owner.user.tag}\nTotal Members: ${message.guild.memberCount}\nCreation Time: ${message.guild.createdAt}\nRegion: ${message.guild.region}\n\`\`\``);
					break;
				case 'user':
					message.channel.send(`\`\`\`\nTag: ${message.author.tag}\nId: ${message.author.id}\nAccount Creation Time: ${message.author.createdAt}\n\`\`\``);
					break;
				default:
					message.reply(`I can only get info on the server or users! Please use \`${client.bot.settings.prefix}info server\` or \`${client.bot.settings.prefix}info user\``);
				}
			},
		},
	],
};

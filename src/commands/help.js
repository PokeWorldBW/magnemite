module.exports = {
	name: 'misc',
	commands: [
		{
			name: 'help',
			description: 'Displays additional help information about a command',
			help: 'Type `${this.prefix}${this.command} [command]` to learn more about how to use that command',
			execute(message) {
				message.channel.send('help is on the way!');
			},
		},
		{
			name: 'commands',
			description: 'Lists all commands',
			help: 'Type `${this.prefix}${this.command}` or `${this.prefix}${this.command} [type]` to see the different commands',
			aliases: ['commandlist', 'commandslist'],
			execute(message) {
				message.channel.send('help is on the way!');
			},
		},
	],
};

const Utilities = require('../utilities.js');

module.exports = {
	name: 'help',
	commands: [
		{
			name: 'help',
			description: 'Displays additional help information about a command',
			help: 'Type `${this.prefix}${this.command} [command]` to learn more about how to use that command',
			execute(message, args, client, props) {
				message.channel.send('help is on the way!')
					.catch(error => Utilities.handleCommandError(client, message, props.command, error));
			},
		},
		{
			name: 'commands',
			description: 'Lists all commands',
			help: 'Type `${this.prefix}${this.command}` or `${this.prefix}${this.command} [type]` to see the different commands',
			aliases: ['commandlist', 'commandslist'],
			execute(message, args, client, props) {
				message.channel.send('help is on the way!')
					.catch(error => Utilities.handleCommandError(client, message, props.command, error));
			},
		},
	],
};

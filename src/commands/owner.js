const Utilities = require('../utilities.js');

module.exports = {
	name: 'owner',
	commands: [
		{
			name: 'resetvariables',
			description: 'Resets variables such as client.userInfo and client.responseCache',
			help: 'Type `${this.prefix}${this.command}`',
			aliases: ['resetvars'],
			execute(message, args, client) {
				Utilities.resetVariables(client);
			},
		},
		{
			name: 'destroy',
			description: 'Destroys the client',
			help: 'Type `${this.prefix}${this.command}`',
			execute(message, args, client) {
				// Don't allow destroy command to work on Heroku
				if (process.env._ != '/app/.heroku/node/bin/npm') {
					client.destroy();
					process.exit();
				}
			},
		},
		{
			name: 'say',
			description: 'Makes the bot send a message',
			help: 'Type `${this.prefix}${this.command} [phrase]`',
			execute(message, args) {
				const msg = Utilities.combineArgs(args);
				if (msg == null) {
					return message.reply('you need to provide me with something to say!');
				}
				message.delete();
				message.channel.send(msg);
			},
		},
		{
			name: 'shutdown',
			description: 'Prepares the bot to shut down by preventing any new activities from being started',
			help: 'Type `${this.prefix}${this.command}`',
			execute(message, args, client) {
				if (client.bot.shuttingDown) {
					client.bot.shuttingDown = false;
					message.channel.send('Cancelled shutdown preparations.');
				} else {
					client.bot.shuttingDown = true;
					message.channel.send('Beginning shutdown preparations!');
					// TO-DO: Print out active activity sessions
				}
			},
		},
		{
			name: 'setstatus',
			description: 'Sets the bot\'s status',
			help: 'Type `${this.prefix}${this.command} [status]`',
			execute(message, args, client) {
				const status = Utilities.combineArgs(args);
				console.log(status);
				if (status == null) {
					client.user.setPresence({ activity: { name: '' } });
				} else {
					client.user.setPresence({ activity: { name: status } });
				}
			},
		},
		{
			name: 'setavatar',
			description: 'Sets the bot\'s avatar',
			help: 'Type `${this.prefix}${this.command} [image]`',
			execute(message, args, client) {
				const image = Utilities.combineArgs(args).toLowerCase();
				if (Object.prototype.hasOwnProperty.call(client.bot.settings.avatars, image)) {
					client.user.setAvatar(client.bot.settings.avatars[image]).catch(console.error);
				} else {
					message.reply('I couldn\'t find that image.');
				}
			},
		},
	],
};

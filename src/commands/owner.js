const Utilities = require('../utilities.js');

module.exports = {
	name: 'owner',
	commands: [
		{
			name: 'resetvariables',
			description: 'Ping!',
			help: '',
			execute(message, args, client) {
				Utilities.resetVariables(client);
			},
			aliases: ['resetvars'],
		},
		{
			name: 'destroy',
			description: '',
			help: '',
			execute(message, args, client) {
				// Don't allow destroy command to work on Heroku
				if (process.env._ != '/app/.heroku/node/bin/npm') {
					client.destroy();
					process.exit();
				}
			},
		},
	],
};

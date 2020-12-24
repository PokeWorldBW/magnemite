module.exports = {
	name: 'misc',
	commands: [
		{
			name: 'help',
			description: '',
			help: 'dong!',
			execute(message) {
				message.channel.send('help is on the way!');
			},
		},
		{
			name: 'commands',
			description: '',
			help: 'dong!',
			execute(message) {
				message.channel.send('help is on the way!');
			},
		},
	],
};

const Discord = require('discord.js');
const Utilities = require('../utilities.js');

let magic8BallAnswers = [];

module.exports = {
	name: 'fun',
	commands: [
		{
			name: 'iq',
			description: 'Tells you your IQ!',
			help: 'Type `${this.prefix}${this.command}`',
			execute(message, args, client, props) {
				const userID = message.author.id;
				if (!client.userInfo.has(userID)) {
					client.userInfo.set(userID, new Discord.Collection());
				}
				const userData = client.userInfo.get(userID);
				let iq;
				if (!userData.has('iq')) {
					// adapted from https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
					const u1 = Math.random(), u2 = Math.random(), trig = Math.random() < 0.5 ? Math.cos : Math.sin;
					const z = Math.sqrt(-2 * Math.log(u1)) * trig(2 * Math.PI * u2);
					iq = z * 15 + 100;
					if (message.channel.name === 'power-plant') {
						// Increase IQ (if less than 144)
						iq = Math.sqrt(iq) * (12 + Math.random());
					}
					// Decrease IQ
					// if (false) { iq = Math.floor((iq - Math.pow(Math.random() * 10 + Math.random(), Math.random() + 1)) * 10) / 10; }
					if (userID === client.id) {
						iq *= Math.floor(Math.pow(10, 1 + Math.random())) / 10;
					}
					userData.set('iq', iq);
				} else {
					iq = userData.get('iq');
				}
				message.channel.send(`<@${userID}>'s IQ is ${iq.toFixed(1)}.`)
					.catch(error => Utilities.handleCommandError(client, message, props.command, error));
			},
		},
		{
			name: 'avatar',
			description: '',
			help: 'Type `${this.prefix}${this.command}` to get the link to your own avatar, or `${this.prefix}${this.command} [@user]...` to check another user\'s avatar',
			aliases: ['icon', 'pfp'],
			execute(message, args, client, props) {
				if (!message.mentions.users.size) {
					return message.channel.send(`Your avatar: <${message.author.displayAvatarURL({ format: 'png', dynamic: true })}>`)
						.catch(error => { console.error(`Error in 'avatar' command: ${error}`); });
				}

				const avatarList = message.mentions.users.map(user => {
					return `${user.username}'s avatar: <${user.displayAvatarURL({ format: 'png', dynamic: true })}>`;
				});
				// send the entire array of strings as a message
				// by default, discord.js will `.join()` the array with `\n`
				message.channel.send(avatarList)
					.catch(error => Utilities.handleCommandError(client, message, props.command, error));
			},
		},
		{
			name: '8ball',
			description: '',
			help: '',
			aliases: ['eightball', 'magic8ball', 'magiceightball'],
			execute(message, args, client, props) {
				if (magic8BallAnswers.length == 0) {
					magic8BallAnswers = Utilities.loadDataFromFile('8ball.txt');
				}
				const data = Utilities.combineArgs(args);
				if (data == null) {
					return message.reply(`you forgot to ask me something! Correct usage is \`${props.prefix}${props.command} [question]\``)
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				}
				const question = data.replace(/[^A-z0-9]+/g, '').toLowerCase();
				if (!client.responseCache.has('8ball')) {
					client.responseCache.set('8ball', new Discord.Collection());
				}
				const responseData = client.responseCache.get('8ball');
				let response;
				if (!responseData.has(question)) {
					response = magic8BallAnswers[Utilities.rand(0, magic8BallAnswers.length)];
					if (!['Concentrate and ask again.', 'Reply hazy try again.'].includes(response)) {
						responseData.set(question, response);
					}
				} else {
					response = responseData.get(question);
				}
				message.channel.send(response)
					.catch(error => Utilities.handleCommandError(client, message, props.command, error));
			},
		},
	],
};

const Discord = require('discord.js');

module.exports = {
	name: 'fun',
	commands: [
		{
			name: 'iq',
			description: '',
			help: '',
			execute(message, args, client) {
				const userID = message.author.id;
				if (!client.userInfo.has(userID)) {
					client.userInfo.set(userID, new Discord.Collection());
				}
				const userData = client.userInfo.get(userID);
				if (!userData.has('iq')) {
					// adapted from https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
					const u1 = Math.random(), u2 = Math.random(), trig = Math.random() < 0.5 ? Math.cos : Math.sin;
					const z = Math.sqrt(-2 * Math.log(u1)) * trig(2 * Math.PI * u2);
					let iq = z * 15 + 100;
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
				}
				message.channel.send(`<@${userID}>'s IQ is ${userData.get('iq').toFixed(1)}.`);
			},
		},
		{
			name: 'avatar',
			description: '',
			help: '',
			aliases: ['icon', 'pfp'],
			execute(message) {
				if (!message.mentions.users.size) {
					return message.channel.send(`Your avatar: <${message.author.displayAvatarURL({ format: 'png', dynamic: true })}>`);
				}

				const avatarList = message.mentions.users.map(user => {
					return `${user.username}'s avatar: <${user.displayAvatarURL({ format: 'png', dynamic: true })}>`;
				});
				// send the entire array of strings as a message
				// by default, discord.js will `.join()` the array with `\n`
				message.channel.send(avatarList);
			},
		},
	],
};

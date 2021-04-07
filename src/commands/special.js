const moment = require('moment-timezone');
const Utilities = require('../utilities.js');

module.exports = {
	name: 'special',
	commands: [
		{
			name: 'emojiusage',
			description: 'Shows how many times each custom emoji was used to react to a message in this server',
			help: 'Type `${this.prefix}${this.command}` to show this month\'s data or `${this.prefix}${this.command} last` for last month\'s data',
			execute(message, args, client) {
				let storageName, month;
				if (args.length == 1 && args[0].toLowerCase() == 'last') {
					storageName = 'LAST_MONTH_REACTIONS';
					month = moment().subtract(1, 'months').tz(client.bot.settings.timeZone).format('MMMM YYYY');
				} else {
					storageName = 'CURRENT_MONTH_REACTIONS';
					month = moment().tz(client.bot.settings.timeZone).format('MMMM YYYY');
				}
				const output = [`**Emoji Reaction Usage for ${month}**`];
				if (client.data.has(storageName)) {
					const storage = client.data.get(storageName);
					const keys = storage.keys();
					if (keys.length == 0) {
						output.push('No data available for this month.');
						message.channel.send(output).catch(error => { console.error(`Error in 'emojiusage' command: ${error}`); });
					} else {
						client.guilds.fetch(client.bot.config.mainServer)
							.then(guild => {
								let emojis = [];
								guild.emojis.cache.forEach(emoji => {
									const compressedId = Utilities.compress(emoji.id);
									const count = storage.has(compressedId) ? storage.get(compressedId) : 0;
									emojis.push({ emoji: emoji, count: count });
								});
								emojis = emojis.sort((a, b) => b.count - a.count);
								for (let i = 0; i < emojis.length; i++) {
									const emoji = emojis[i];
									output.push(`${emoji.emoji} - ${emoji.count}`);
								}
								console.log('output.join(\'\n\').length: ' + output.join('\n').length);
								message.channel.send(output).catch(error => { console.error(`Error in 'emojiusage' command: ${error}`); });
							})
							.catch(error => { console.error(`Error fetching main server in 'emojiusage' command: ${error}`); });
					}
				}
			},
		},
	],
};

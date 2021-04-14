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
								let out = [output[0]], mess, temp;
								for (let n = 1; n < output.length; n += 50) {
									mess = output.slice(n, Math.min(n + 50, output.length));
									for (let x = 0; x < mess.length; x += 5) {
										temp = [];
										for (let y = 0; y < 5; y++) {
											if (x + y < mess.length) {
												temp.push(mess[x + y]);
											} else {
												break;
											}
										}
										out.push(temp.join(' | '));
									}
									message.channel.send(out)
										.catch(error => { console.error(`Error in 'emojiusage' command: ${error}`); });
									out = [];
								}
							})
							.catch(error => { console.error(`Error fetching main server in 'emojiusage' command: ${error}`); });
					}
				}
			},
		},
		{
			name: 'setemojiusage',
			description: 'Sets the usage count of a custom emoji shown by emojiusage',
			help: 'Type `${this.prefix}${this.command} [emojis] [count]` to set the usage of an emoji',
			permissions: 'MANAGE_EMOJIS',
			execute(message, args, client) {
				if (Utilities.isMainServer(client, message.guild.id) && client.user.id != message.author.id && client.data.has('CURRENT_MONTH_REACTIONS')) {
					const emojiIds = Utilities.getEmojiIds(args[0]);
					const count = parseInt(args[1]);
					if (isNaN(count)) {
						message.channel.send(`\`${args[1]}\` is not a number.`);
					}
					if (emojiIds.length > 0) {
						const storage = client.data.get('CURRENT_MONTH_REACTIONS');
						emojiIds.forEach(emojiId => {
							const compressedId = Utilities.compress(emojiId);
							storage.add(compressedId, count);
						});
					}
				}
			}
		}
	],
};

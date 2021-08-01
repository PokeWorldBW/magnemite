const moment = require('moment-timezone');
const Utilities = require('../utilities.js');

module.exports = {
	name: 'special',
	commands: [
		{
			name: 'emojiusage',
			description: 'Shows how many times each custom emoji was used to react to a message in this server',
			help: 'Type `${this.prefix}${this.command}` to show this month\'s data or `${this.prefix}${this.command} last` for last month\'s data',
			execute(message, args, client, props) {
				let storageName, month;
				if (args.length == 1 && args[0].toLowerCase() == 'last') {
					storageName = 'LAST MONTH REACTIONS';
					month = moment().subtract(1, 'months').tz(client.bot.settings.timeZone).format('MMMM YYYY');
				} else {
					storageName = 'CURRENT MONTH REACTIONS';
					month = moment().tz(client.bot.settings.timeZone).format('MMMM YYYY');
				}
				const output = [`**Emoji Reaction Usage for ${month}**`];
				if (client.data.has(storageName)) {
					const storage = client.data.get(storageName);
					const keys = storage.keys();
					if (keys.length == 0) {
						output.push('No data available for this month.');
						message.channel.send(output)
							.catch(error => Utilities.handleCommandError(client, message, props.command, error));
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
										.catch(error => Utilities.handleCommandError(client, message, props.command, error));
									out = [];
								}
							})
							.catch(error => Utilities.handleCommandError(client, message, props.command, error));
					}
				}
			},
		},
		{
			name: 'setemojiusage',
			description: 'Sets the usage count of a custom emoji shown by emojiusage',
			help: 'Type `${this.prefix}${this.command} [emojis] [count]` to set the usage of an emoji',
			permissions: 'MANAGE_EMOJIS',
			execute(message, args, client, props) {
				if (Utilities.isMainServer(client, message.guild) && client.user.id != message.author.id && client.data.has('CURRENT MONTH REACTIONS')) {
					const emojiIds = Utilities.getEmojiIds(args[0]);
					const count = parseInt(args[1]);
					if (isNaN(count)) {
						message.channel.send(`\`${args[1]}\` is not a number.`)
							.catch(error => Utilities.handleCommandError(client, message, props.command, error));
					}
					if (emojiIds.length > 0) {
						const storage = client.data.get('CURRENT MONTH REACTIONS');
						emojiIds.forEach(emojiId => {
							const compressedId = Utilities.compress(emojiId);
							storage.add(compressedId, count);
						});
					}
				}
			},
		},
		/* {
			name: 'vote',
			description: 'Votes for a person',
			help: 'Type `${this.prefix}${this.command}`',
			execute(message, args, client, props) {
				if (client.data.has('VOTES')) {
					const voteData = client.data.get('VOTES');
					if (voteData.keys().length == 0) {
						message.reply('no vote has started yet!')
							.catch(error => Utilities.handleCommandError(client, message, props.command, error));
					} else {
						const target = Utilities.combineArgs(args);
						const options = voteData.keys();
						for (let i = 0; i < options.length; i++) {
							if (target.toLowerCase() == options[i].toLowerCase()) {
								// No need to vote again if they already voted for this option
								const vote = voteData.get(options[i]);
								if (vote.voters.indexOf('') != -1) {
									return message.reply(`you already voted for ${options[i]}!`)
										.catch(err => Utilities.handleCommandError(client, message, props.command, err));
								}

								let verb = 'voted for';
								// Remove any previous votes
								if (verb == 2) {
									verb = 'changed their vote to';
								}

								// Add vote to new option
								vote.voters.push('');
								vote.voteCount++;
								voteData.save();
								return message.channel.send(' voted for !')
									.catch(err => Utilities.handleCommandError(client, message, props.command, err));
							}
						}
						message.channel.send(`${target} is not an option you can vote, idiot!`)
							.catch(err => Utilities.handleCommandError(client, message, props.command, err));
					}
				} else {
					message.reply('no vote data was found!')
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				}
			},
		},
		{
			name: 'unvote',
			description: 'Undoes your previously cast vote',
			help: 'Type `${this.prefix}${this.command}`',
			execute(message, args, client, props) {
				if (client.data.has('VOTES')) {
					const voteData = client.data.get('VOTES');
					if (voteData.keys().length == 0) {
						message.reply('no vote has started yet!')
							.catch(error => Utilities.handleCommandError(client, message, props.command, error));
					} else {
						const target = Utilities.combineArgs(args);
						const options = voteData.keys();
						for (let i = 0; i < options.length; i++) {
							if (target.toLowerCase() == options[i].toLowerCase()) {
								// No need to vote again if they already voted for this option
								const vote = voteData.get(options[i]);
								if (vote.voters.indexOf('') != -1) {
									return message.reply(`you already voted for ${options[i]}!`)
										.catch(err => Utilities.handleCommandError(client, message, props.command, err));
								}

								let verb = 'voted for';
								// Remove any previous votes
								if (verb == 2) {
									verb = 'changed their vote to';
								}

								// Add vote to new option
								vote.voters.push('');
								vote.voteCount++;
								voteData.save();
								return message.channel.send(' voted for !')
									.catch(err => Utilities.handleCommandError(client, message, props.command, err));
							}
						}
						message.channel.send(`${target} is not an option you can vote, idiot!`)
							.catch(err => Utilities.handleCommandError(client, message, props.command, err));
					}
				} else {
					message.reply('no vote data was found!')
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				}
			},
		},
		{
			name: 'votecount',
			description: 'Displays a votecount for the current vote',
			help: 'Type `${this.prefix}${this.command}`',
			execute(message, args, client, props) {
				if (client.data.has('VOTES')) {
					const voteData = client.data.get('VOTES');
					if (voteData.keys().length == 0) {
						message.reply('no vote has started yet!')
							.catch(error => Utilities.handleCommandError(client, message, props.command, error));
					} else {
						// These results could be cached until votes are changed, but there isn't going to be enough data to make this computationally intensive anyway
						let results = [];
						results.push('**VOTE COUNT**');
						const votes = voteData.get('votes');
						if (Object.keys(votes).length == 0) {
							results.push('*No votes have been cast yet!*');
						} else {
							results.push('```');

							const voteCount = new Map();
							const options = voteData.get('options');
							for (let i = 0; i < options.length; i++) {
								voteCount.set(options[i], { count: 0, voters: [] });
							}

							let voterMap = null;
							if (voteData.has('voterMap')) {
								voterMap = voteData.get('voterMap');
							}

							let option, name;
							for (const [key, value] of Object.entries(votes)) {
								option = voteCount.get(value);
								option.count++;
								name = key;
								if (Object.prototype.hasOwnProperty.call(voterMap, key)) {
									name = voterMap[key];
								}
								option.voters.push(name);
							}

							options.map(opt => {
								const voted = voteData.get(opt);
								return { voted: opt, voteCount: voted.count, voters: voted.voters };
							})
								.filter(data => data.voteCount != 0)
								.sort((a, b) => b.voteCount - a.voteCount)
								.map(data => `${data.voted} (${data.voteCount}): ${data.voters.join(', ')}`);

							results = results.concat(options);
							results.push('```');
						}
						message.channel.send(results.join('\n'))
							.catch(error => Utilities.handleCommandError(client, message, props.command, error));
					}
				} else {
					message.reply('no vote data was found!')
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				}
			},
		}, */
	],
};

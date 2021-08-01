const moment = require('moment-timezone');
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
			execute(message, args, client, props) {
				const msg = Utilities.combineArgs(args);
				if (msg == null) {
					message.reply('you need to provide me with something to say!')
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				}
				message.delete().catch(error => Utilities.handleCommandError(client, message, props.command, error));
				message.channel.send(msg).catch(error => Utilities.handleCommandError(client, message, props.command, error));
			},
		},
		{
			name: 'shutdown',
			description: 'Prepares the bot to shut down by preventing any new activities from being started',
			help: 'Type `${this.prefix}${this.command}`',
			execute(message, args, client, props) {
				if (client.bot.shuttingDown) {
					client.bot.shuttingDown = false;
					message.channel.send('Cancelled shutdown preparations.')
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				} else {
					client.bot.shuttingDown = true;
					message.channel.send('Beginning shutdown preparations!')
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
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
			execute(message, args, client, props) {
				const image = Utilities.combineArgs(args).toLowerCase();
				if (Object.prototype.hasOwnProperty.call(client.bot.settings.avatars, image)) {
					client.user.setAvatar(client.bot.settings.avatars[image]).catch(error => { console.error(`Error in 'setavatar' command: ${error}`); });
				} else {
					message.reply('I couldn\'t find that image.')
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				}
			},
		},
		{
			name: 'announce',
			description: 'Creates an announcement to send in a channel at a specified time',
			help: 'Type `${this.prefix}${this.command} [channelId] [time] [timeZone] [message]`',
			execute(message, args, client, props) {
				if (args.length < 4) {
					return message.reply(`correct usage is \`${props.prefix}${props.command} [channelId] [time] [timeZone] [message]\``)
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				}

				const channelId = args[0];
				if (!client.channels.cache.has(channelId)) {
					return message.reply(`I am not in channel \`${channelId}\`!`)
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				}

				if (moment.tz.names().map(zone => zone.toLowerCase()).indexOf(args[2].toLowerCase()) == -1) {
					return message.reply(`couldn't find a time zone called \`${args[2]}\`\nCheck <https://en.wikipedia.org/wiki/List_of_tz_database_time_zones> for a list of valid time zones`)
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				}
				const time = moment.tz(args[1], moment.ISO_8601, true, args[2]).utc();
				if (!time.isValid()) {
					return message.reply('correct time format is [year]-[month]-[day]T[hour]:[minute]')
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				}
				if (moment().isAfter(time)) {
					return message.reply('that time is in the past!')
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				}

				const messageToSend = Utilities.combineArgs(args.slice(3));
				if (messageToSend == null) {
					return message.reply('you need to provide me with something to say!')
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				}

				const channelToSend = client.channels.cache.get(channelId);
				const timeToSend = time.toDate().getTime();
				const timeUntilSend = timeToSend - (new Date).getTime();
				const id = ++client.announcements.lastId;
				client.announcements.timeouts.set(id, setTimeout(Utilities.sendMessage, timeUntilSend, channelToSend, messageToSend));

				const announcement = {
					channelId: channelId,
					timeToSend: timeToSend,
					messageToSend: messageToSend,
					id: id,
				};
				if (client.data.has('ANNOUNCEMENTS')) {
					const storage = client.data.get('ANNOUNCEMENTS');
					if (storage.has('announcements')) {
						const announcements = storage.get('announcements');
						announcements.push(announcement);
						storage.add('announcements', announcements);
					} else {
						storage.add('announcements', [ announcement ]);
					}
				}

				message.channel.send(`Announce to \`${channelToSend.guild}\`#\`${channelToSend.name}\` at \`${time.format('dddd MM/DD/YYYY HH:mm [[UTC]]')}\`:\n\`\`\`\n${messageToSend}\n\`\`\``)
					.catch(error => Utilities.handleCommandError(client, message, props.command, error));
			},
		},
		{
			name: 'announcements',
			description: 'Lists the announcements that still need to be made',
			help: 'Type `${this.prefix}${this.command}`',
			execute(message, args, client, props) {
				if (client.data.has('ANNOUNCEMENTS')) {
					const storage = client.data.get('ANNOUNCEMENTS');
					if (storage.has('announcements')) {
						const announcements = storage.get('announcements');
						if (announcements.length > 0) {
							const list = announcements.map(announcement => {
								const channel = client.channels.cache.get(announcement.channelId);
								const channelName = `\`${channel.guild}\`#\`${channel.name}\``;
								const time = moment.utc(announcement.timeToSend).format('dddd MM/DD/YYYY hh:mm [[UTC]]');
								let msg = announcement.messageToSend;
								if (msg.length > 70) {
									msg = msg.substring(0, 70) + '...';
								}
								return `${announcement.id}) To ${channelName} on \`${time}\`:\n\`${msg}\``;
							}).join('\n');
							return message.channel.send(`Announcements:\n${list}`)
								.catch(error => Utilities.handleCommandError(client, message, props.command, error));
						}
					}
					message.channel.send('There are no pending announcements!')
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				} else {
					message.reply('no announcement data was found!')
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				}
			},
		},
		{
			name: 'cancelannouncement',
			description: 'Cancels a pending announcement',
			help: 'Type `${this.prefix}${this.command} [announcementNumber]`',
			execute(message, args, client, props) {
				if (args.length != 1) {
					return message.reply(`correct usage is \`${props.prefix}${props.command} [announcementNumber]\nGet announcementNumber with ${props.prefix}announcements\``)
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				}
				const id = parseInt(args[0], 10);
				if (isNaN(id)) {
					return message.reply(`correct usage is \`${props.prefix}${props.command} [announcementNumber]\nGet announcementNumber with ${props.prefix}announcements\``)
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				}
				if (client.data.has('ANNOUNCEMENTS')) {
					const storage = client.data.get('ANNOUNCEMENTS');
					if (storage.has('announcements')) {
						const announcements = storage.get('announcements');
						let announcement = null;
						let index;
						for (index = 0; index < announcements.length; index++) {
							if (announcements[index].id == id) {
								announcement = announcements[index];
								break;
							}
						}
						if (announcement != null) {
							const { channelId, timeToSend, messageToSend } = announcement;
							if (client.announcements.timeouts.has(id)) {
								const timeout = client.announcements.timeouts.get(id);
								clearTimeout(timeout);
								client.announcements.timeouts.delete(id);
								announcements.splice(index, 1);
								storage.add('announcements', announcements);
								const channel = client.channels.cache.get(channelId);
								const channelName = `\`${channel.guild}\`#\`${channel.name}\``;
								const time = moment.utc(timeToSend).format('dddd MM/DD/YYYY hh:mm [[UTC]]');
								return message.channel.send(`Canceled **Announcement #${id}** to ${channelName} on \`${time}\`:\n\`\`\`${messageToSend}\`\`\``)
									.catch(error => Utilities.handleCommandError(client, message, props.command, error));
							} else {
								return message.channel.send(`No timeout was set for Announcement #${id}`)
									.catch(error => Utilities.handleCommandError(client, message, props.command, error));
							}
						}
					}
					message.channel.send(`No announcement with id '${id}' found`)
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				} else {
					message.reply('no announcement data was found!')
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				}
			},
		},
		{
			name: 'senddm',
			description: 'Sends a Direct Message to someone',
			help: 'Type `${this.prefix}${this.command} [userId] [message]`',
			execute(message, args, client, props) {
				if (args.length < 2) {
					return message.reply(`correct usage is \`${props.prefix}${props.command} [userId] [message]\``)
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				}
				const userId = args[0];
				const msg = Utilities.combineArgs(args.slice(1));
				if (msg == null) {
					return message.reply('you need to provide me with something to say!')
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				}
				client.users.fetch(userId).then(user => {
					if (user.dmChannel == null) {
						user.createDM().then(dm => dm.send(msg).then(() => {
							message.channel.send(`Sent a Direct Message to \`${user.tag}\`:\n\`\`\`${msg}\`\`\``)
								.catch(error => Utilities.handleCommandError(client, message, props.command, error));
						}))
							.catch(err => {
								message.channel.send(`Couldn't send a Direct Message to \`${user.tag}\`:\n\`\`\`${err}\`\`\``)
									.catch(error => Utilities.handleCommandError(client, message, props.command, error));
							});
					} else {
						user.dmChannel.send(msg)
							.then(() => {
								message.channel.send(`Sent a Direct Message to \`${user.tag}\`:\n\`\`\`${msg}\`\`\``)
									.catch(error => Utilities.handleCommandError(client, message, props.command, error));
							})
							.catch(error => Utilities.handleCommandError(client, message, props.command, error));
					}
				})
					.catch((err) => {
						message.channel.send(`Error finding user \`${userId}\`:\n\`\`\`${err}\`\`\``)
							.catch(error => Utilities.handleCommandError(client, message, props.command, error));
					});
			},
		},
		{
			name: 'edit',
			description: 'Edits one of the bot\'s messages',
			help: 'Type `${this.prefix}${this.command} [channelId] [messageId] [newMessage]`',
			execute(message, args, client, props) {
				if (args.length < 3) {
					return message.reply(`correct usage is \`${props.prefix}${props.command} [channelId] [messageId] [newMessage]\``)
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				}
				const channelId = args[0];
				const messageId = args[1];
				const msg = Utilities.combineArgs(args.slice(2));
				client.channels.fetch(channelId)
					.then(channel => {
						if (!channel.isText()) {
							return message.reply(`channel \`${channelId}\` is not text-based!`)
								.catch(error => Utilities.handleCommandError(client, message, props.command, error));
						}
						channel.messages.fetch(messageId)
							.then(newMessage => {
								newMessage.edit(msg).catch(error => Utilities.handleCommandError(client, message, props.command, error));
								message.delete();
							})
							.catch(error => {
								if (error == 'DiscordAPIError: Unknown Message') {
									return message.reply(`couldn't find message \`${messageId}\`!`)
										.catch(err => Utilities.handleCommandError(client, message, props.command, err));
								} else if (/DiscordAPIError: Invalid Form Body\nmessage_id: Value ".+?" is not snowflake./.test(error)) {
									return message.reply(`\`${messageId}\` is not a valid message id snowflake!`)
										.catch(err => Utilities.handleCommandError(client, message, props.command, err));
								} else {
									Utilities.handleCommandError(client, message, props.command, error);
								}
							});
					})
					.catch(error => {
						if (error == 'DiscordAPIError: Unknown Channel') {
							return message.reply(`couldn't find channel \`${channelId}\`!`)
								.catch(err => Utilities.handleCommandError(client, message, props.command, err));
						} else if (/DiscordAPIError: Invalid Form Body\nchannel_id: Value ".+?" is not snowflake./.test(error)) {
							return message.reply(`\`${channelId}\` is not a valid channel id snowflake!`)
								.catch(err => Utilities.handleCommandError(client, message, props.command, err));
						} else {
							Utilities.handleCommandError(client, message, props.command, error);
						}
					});
			},
		},
		{
			name: 'startvote',
			description: 'Starts a vote',
			help: 'Type `${this.prefix}${this.command} [choices] [channelId] [eligibleVoters]`',
			execute(message, args, client, props) {
				if (args.length < 1 || args.length > 3) {
					return message.reply(`correct usage is \`${props.prefix}${props.command} [choices] [channelId] [eligibleVoters]\``)
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				}

				if (client.data.has('VOTES')) {
					const voteData = client.data.get('VOTES');
					if (voteData.has('options')) {
						return message.reply(`a vote already exists, use \`${props.prefix}endvote\` to end it.`)
							.catch(error => Utilities.handleCommandError(client, message, props.command, error));
					} else {
						const tempData = new Map();
						const choices = args[0].split(',');
						tempData.set('options', choices);
						tempData.set('votes', {});

						let channelId = null;
						if (args.length >= 2) {
							channelId = args[1];
							if (!client.channels.cache.has(channelId)) {
								return message.reply(`I am not in channel \`${channelId}\`!`)
									.catch(error => Utilities.handleCommandError(client, message, props.command, error));
							} else {
								tempData.set('channelId', channelId);
							}
						}

						let eligibleVoters = null;
						if (args.length == 3) {
							eligibleVoters = args[2].split(',');
							const voterMap = {};
							let voter, index, id, name;
							for (let i = 0; i < eligibleVoters.length; i++) {
								voter = eligibleVoters[i];
								index = voter.indexOf('=');
								if (index == -1) {
									return message.reply(`eligibleVoters is not formatted correctly. Expected a \`=\` in ${voter} to map an id to a name`)
										.catch(error => Utilities.handleCommandError(client, message, props.command, error));
								} else {
									id = voter.substring(0, index);
									name = voter.slice(index + 1);
									voterMap[id] = name;
								}
							}
							tempData.set('voterMap', voterMap);
						}

						tempData.forEach((value, key) => voteData.add(key, value));

						const output = [];
						if (channelId != null) {
							const channel = client.channels.cache.get(channelId);
							output.push(`A vote was started in ${channel.guild}#${channel.name} with the following choices: \`${choices.join(', ')}\``);
							if (eligibleVoters != null) {
								const names = tempData.get('voterMap').values().join(', ');
								output.push(`\nEligible Voters: ${names}`);
							}
						} else {
							output.push(`A vote was started with the following choices: \`${choices.join(', ')}\``);
						}

						message.channel.send(output.join(''))
							.catch(error => Utilities.handleCommandError(client, message, props.command, error));
					}
				} else {
					message.reply('no vote data was found!')
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				}
			},
		},
		{
			name: 'endvote',
			description: 'Ends a vote',
			help: 'Type `${this.prefix}${this.command}` [secret?]',
			execute(message, args, client, props) {
				if (client.data.has('VOTES')) {
					const voteData = client.data.get('VOTES');
					if (!voteData.has('options')) {
						message.reply('there is no vote going on!')
							.catch(error => Utilities.handleCommandError(client, message, props.command, error));
					} else {
						let results = [];
						if (args.length > 0 && args[0].toLowerCase() == 'secret') {
							message.channel.send('The vote has ended.')
								.catch(error => Utilities.handleCommandError(client, message, props.command, error));
						} else {
							results.push('**VOTE RESULTS**');
							const votes = voteData.get('votes');
							if (Object.keys(votes).length == 0) {
								results.push('*No votes were cast!*');
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
						voteData.clear();
					}
				} else {
					message.reply('no vote data was found!')
						.catch(error => Utilities.handleCommandError(client, message, props.command, error));
				}
			},
		},
		{
			name: 'removevote',
			description: 'Removes a vote cast by someone',
			help: 'Type `${this.prefix}${this.command}` [id]',
			execute(message, args, client, props) {
				message.channel.send('test').catch(err => Utilities.handleCommandError(client, message, props.command, err));
			},
		},
		{
			name: 'test',
			description: 'Test command',
			help: 'Type `${this.prefix}${this.command}`',
			execute(message, args, client, props) {
				message.channel.send('test').catch(err => Utilities.handleCommandError(client, message, props.command, err));
			},
		},
	],
};

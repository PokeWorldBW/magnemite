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
			execute(message, args) {
				const msg = Utilities.combineArgs(args);
				if (msg == null) {
					return message.reply('you need to provide me with something to say!');
				}
				message.delete();
				message.channel.send(msg).catch(error => { console.error(`Error in 'say' command: ${error}`); });
			},
		},
		{
			name: 'shutdown',
			description: 'Prepares the bot to shut down by preventing any new activities from being started',
			help: 'Type `${this.prefix}${this.command}`',
			execute(message, args, client) {
				if (client.bot.shuttingDown) {
					client.bot.shuttingDown = false;
					message.channel.send('Cancelled shutdown preparations.').catch(error => { console.error(`Error in 'shutdown' command: ${error}`); });
				} else {
					client.bot.shuttingDown = true;
					message.channel.send('Beginning shutdown preparations!').catch(error => { console.error(`Error in 'shutdown' command: ${error}`); });
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
			execute(message, args, client) {
				const image = Utilities.combineArgs(args).toLowerCase();
				if (Object.prototype.hasOwnProperty.call(client.bot.settings.avatars, image)) {
					client.user.setAvatar(client.bot.settings.avatars[image]).catch(error => { console.error(`Error in 'setavatar' command: ${error}`); });
				} else {
					message.reply('I couldn\'t find that image.');
				}
			},
		},
		{
			name: 'announce',
			description: 'Creates an announcement to send in a channel at a specified time',
			help: 'Type `${this.prefix}${this.command} [channelId] [time] [timeZone] [message]`',
			execute(message, args, client, props) {
				if (args.length < 4) {
					return message.reply(`correct usage is \`${props.prefix}${props.command} [channelId] [time] [timeZone] [message]\``);
				}

				const channelId = args[0];
				if (!client.channels.cache.has(channelId)) {
					return message.reply(`I am not in channel \`${channelId}\`!`);
				}

				if (moment.tz.names().map(zone => zone.toLowerCase()).indexOf(args[2].toLowerCase()) == -1) {
					return message.reply(`couldn't find a time zone called \`${args[2]}\`\nCheck <https://en.wikipedia.org/wiki/List_of_tz_database_time_zones> for a list of valid time zones`);
				}
				const time = moment.tz(args[1], moment.ISO_8601, true, args[2]).utc();
				if (!time.isValid()) {
					return message.reply('correct time format is [year]-[month]-[day]T[hour]:[minute]');
				}
				if (moment().isAfter(time)) {
					return message.reply('that time is in the past!');
				}

				const messageToSend = Utilities.combineArgs(args.slice(3));
				if (messageToSend == null) {
					return message.reply('you need to provide me with something to say!');
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

				message.channel.send(`Announce to \`${channelToSend.guild}\`#\`${channelToSend.name}\` at \`${time.format('dddd MM/DD/YYYY hh:mm [[UTC]]')}\`:\n\`\`\`\n${messageToSend}\n\`\`\``)
					.catch(error => { console.error(`Error in 'announce' command: ${error}`); });
			},
		},
		{
			name: 'announcements',
			description: 'Lists the announcements that still need to be made',
			help: 'Type `${this.prefix}${this.command}`',
			execute(message, args, client) {
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
							return message.channel.send(`Announcements:\n${list}`).catch(error => { console.error(`Error in 'announcements' command: ${error}`); });
						}
					}
					message.channel.send('There are no pending announcements!').catch(error => { console.error(`Error in 'announcements' command: ${error}`); });
				} else {
					message.reply('no announcement data was found!').catch(error => { console.error(`Error in 'announcements' command: ${error}`); });
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
						.catch(error => { console.error(`Error with 'cancelannouncement' command: ${error}`); });
				}
				const id = parseInt(args[0], 10);
				if (isNaN(id)) {
					return message.reply(`correct usage is \`${props.prefix}${props.command} [announcementNumber]\nGet announcementNumber with ${props.prefix}announcements\``)
						.catch(error => { console.error(`Error with 'cancelannouncement' command: ${error}`); });
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
								return message.channel.send(`Canceled **Announcement #${id}** to ${channelName} on \`${time}\`:\n\`\`\`${messageToSend}\`\`\``).catch(error => { console.error(`Error in 'announcements' command: ${error}`); });
							} else {
								return message.channel.send(`No timeout was set for Announcement #${id}`).catch(error => { console.error(`Error in 'cancelannouncement' command: ${error}`); });
							}
						}
					}
					message.channel.send(`No announcement with id '${id}' found`).catch(error => { console.error(`Error in 'cancelannouncement' command: ${error}`); });
				} else {
					message.reply('no announcement data was found!').catch(error => { console.error(`Error in 'cancelannouncement' command: ${error}`); });
				}
			},
		},
		{
			name: 'senddm',
			description: 'Sends a Direct Message to someone',
			help: 'Type `${this.prefix}${this.command} [userId] [message]`',
			execute(message, args, client, props) {
				if (args.length < 2) {
					return message.reply(`correct usage is \`${props.prefix}${props.command} [userId] [message]\``).catch(error => { console.error(`Error with 'senddm' command: ${error}`); });
				}
				const userId = args[0];
				const msg = Utilities.combineArgs(args.slice(1));
				if (msg == null) {
					return message.reply('you need to provide me with something to say!').catch(error => { console.error(`Error with 'senddm' command: ${error}`); });
				}
				client.users.fetch(userId).then(user => {
					if (user.dmChannel == null) {
						user.createDM().then(dm => dm.send(msg).then(() => {
							message.channel.send(`Sent a Direct Message to \`${user.tag}\`:\n\`\`\`${msg}\`\`\``).catch(error => { console.error(`Error with 'senddm' command: ${error}`); });
						}))
							.catch(err => {
								message.channel.send(`Couldn't send a Direct Message to \`${user.tag}\`:\n\`\`\`${err}\`\`\``).catch(error => { console.error(`Error with 'senddm' command: ${error}`); });
							});
					} else {
						user.dmChannel.send(msg)
							.then(() => {
								message.channel.send(`Sent a Direct Message to \`${user.tag}\`:\n\`\`\`${msg}\`\`\``).catch(error => { console.error(`Error with 'senddm' command: ${error}`); });
							})
							.catch(error => { console.error(`Error with 'senddm' command: ${error}`); });
					}
				})
					.catch((err) => {
						message.channel.send(`Error finding user \`${userId}\`:\n\`\`\`${err}\`\`\``).catch(error => { console.error(`Error with 'senddm' command: ${error}`); });
					});
			},
		},
	],
};

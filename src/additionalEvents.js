module.exports = {
	eventListeners: [
		{
			event: 'messageDelete',
			listen(message) {
				if (message.channel.type == 'text' && !message.author.bot) {
					const content = message.cleanContent.length > 0 ? `\`\`\`\n${message.cleanContent}\`\`\`` : '';
					const attachments = message.attachments.map(a => `<${a.attachment}>`).join('\n');
					const attachMessage = attachments.length > 0 ? `\`Attachments:\`\n${attachments}` : '';
					return `Message from \`${message.author.tag}\` in \`${message.guild.name}\`#\`${message.channel.name}\` was deleted:\n${content}${attachMessage}`;
				}
				return null;
			},
		},
		{
			event: 'messageUpdate',
			listen(oldMessage, newMessage) {
				if (!oldMessage.author.bot && oldMessage.content != newMessage.content) {
					if (oldMessage.channel.type == 'text') {
						return `Message from \`${oldMessage.author.tag}\` in \`${oldMessage.guild.name}\`#\`${oldMessage.channel.name}\` was edited\nOld Message:\n\`\`\`\n${oldMessage.cleanContent}\n\`\`\`New Message:\n\`\`\`\n${newMessage.cleanContent}\n\`\`\``;
					} else if (oldMessage.channel.type == 'dm') {
						return `Direct Message from \`${oldMessage.author.tag}\` was edited\nOld Message:\n\`\`\`\n${oldMessage.cleanContent}\n\`\`\`New Message:\n\`\`\`\n${newMessage.cleanContent}\n\`\`\``;
					}
				}
				return null;
			},
		},
	],
};

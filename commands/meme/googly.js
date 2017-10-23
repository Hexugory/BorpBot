const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class GooglyCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'googly',
			group: 'meme',
			memberName: 'googly',
			description: 'Posts a googly.',
			examples: ['\'googly']
		});
	}
	
	hasPermission(msg) {
		return msg.client.isOwner(msg.author) || (msg.guild && (msg.member.permissions.has('MANAGE_MESSAGES') || msg.client.provider.get(msg.guild, 'memeChannelIDs', []).includes(msg.channel.id)))
	}

	async run(msg, args) {
		let googs = this.client.provider.get('global', 'googs', []);
		return msg.channel.send(`${googs[Math.floor(Math.random() * googs.length)]}`);
	}
};

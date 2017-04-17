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
	

	async run(msg, args) {
		let googs = this.client.provider.get('global', 'googs', []);
		return msg.channel.sendMessage(`${googs[Math.floor(Math.random() * googs.length)]}`);
	}
};

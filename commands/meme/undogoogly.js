const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class UndoGooglyCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'undogoogly',
			group: 'meme',
			memberName: 'undogoogly',
			description: 'Removes the last googly.',
			examples: ['\'undogoogly'],
			guildOnly: true
		});
	}
	
	hasPermission(msg) {
		if(msg.client.isOwner(msg.author)){
			return true;
		}
		else if(msg.client.provider.get(msg.guild, 'commandBlacklistIDs', []).includes(msg.author.id)){
			return false;
		}
		else if(msg.client.provider.get(msg.guild, 'memeChannelIDs', []).includes(msg.channel.id)){
			return true
		}
		else{
			return msg.member.hasPermission(mMessages)
		}
	}

	async run(msg, args) {
		let googs = this.client.provider.get('global', 'googs', []);
		let undone = this.client.provider.get(msg.guild, 'undoneg', true);
		if(undone === false){
			googs.length -= 1;
			this.client.provider.set('global', 'googs', googs);
			this.client.provider.set(msg.guild, 'undoneg', true);
			return msg.reply('Last googly removed.');
		}
		else{
			return msg.reply('The last googly made has already been undone, you cannot undo further.');
		}
	}
};

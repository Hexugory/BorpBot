const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const mMessages = require('../../perms.js').mMessages;

module.exports = class RemoveGooglyCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'removegoogly',
			group: 'meme',
			memberName: 'removegoogly',
			description: 'Removes a specified googly. (Owner)',
			examples: ['\'removecommand http://i.imgur.com/zfDrfTE.png'],

			args: [
				{
					key: 'out',
					label: 'out',
					prompt: 'The googly output.',
					type: 'string',
					default: 0
				}
			]
		});
	}
	
	hasPermission(msg) {
		return msg.client.isOwner(msg.author);
	}

	async run(msg, args) {
		let googs = this.client.provider.get('global', 'googs', []);
		if(args.out === 0){
			googs.length -= 1;
			this.client.provider.set('global', 'googs', googs);
			return msg.reply('Last googly removed.');
		}
		else{
			googs.splice(googs.indexOf(args.out), 1);
			this.client.provider.set('global', 'googs', googs);
			return msg.reply(`\`${args.out}\` removed.`);
		}
	}
};

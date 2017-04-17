const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const mMessages = require('../../perms.js').mMessages;

module.exports = class NewGooglyCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'newgoogly',
			group: 'meme',
			memberName: 'newgoogly',
			description: 'Adds a googly.',
			throttling:{usages:1, duration:20},
			examples: ['\'newgoogly http://i.imgur.com/zfDrfTE.png'],
			guildOnly: true,

			args: [
				{
					key: 'out',
					label: 'output',
					prompt: 'Enter googly link',
					type: 'string',
					default: 'blank'
				}
			]
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
		if(googs.includes(args.out)){
			return msg.reply("There's already a googly with that link.");
		}
		else if(args.out === 'blank'){
			return msg.reply("Why would you want a googly like that?");
		}
		else{
			this.client.provider.set(msg.guild, 'undoneg', false);
			googs.push(args.out);
			this.client.provider.set('global', 'googs', googs);
			return msg.reply(`${args.out} added. Undo mistakes with \`'undogoogly\`.`);
		}
	}
};

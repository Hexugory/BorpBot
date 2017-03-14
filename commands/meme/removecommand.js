const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const mMessages = require('../../perms.js').mMessages;

module.exports = class AnnounceToggleCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'removecommand',
			group: 'meme',
			memberName: 'removecommand',
			description: 'Removes a custom command.',
			examples: ['\'removecommand sumirekt'],

			args: [
				{
					key: 'name',
					label: 'name',
					prompt: 'The command input.',
					type: 'string',
					default: 0
				}
			]
		});
	}
	
	hasPermission(msg) {
		if(msg.client.isOwner(msg.author)){
			return true;
		}
		else{
			//manage messages
			return msg.member.hasPermission(mMessages);
		}
	}

	async run(msg, args) {
		let customCommands = this.client.provider.get(msg.guild, 'customCommands', []);
		if(args.name === 0){
			customCommands.length -= 1;
			return msg.reply('Last command removed');
		}
		else{
			customCommands.splice(customCommands.findIndex(function(element){return element.name === args.name}), 1);
			return msg.reply(`\`'${args.name}\` removed.`);
		}
		this.client.provider.set(msg.guild, 'customCommands', customCommands);
	}
};

const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const mMessages = require('../../perms.js').mMessages;

module.exports = class RemoveCustomCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'removecommand',
			group: 'meme',
			memberName: 'removecommand',
			description: 'Removes a specified custom command. (Manage Messages)',
			examples: ['\'removecommand sumirekt'],
			guildOnly: true,

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
			return msg.member.hasPermission(mMessages);
		}
	}

	async run(msg, args) {
		function findCommand(element){return element.name === args.name};
		let customCommands = this.client.provider.get(msg.guild, 'customCommands', []);
		if(args.name === 0){
			customCommands.length -= 1;
			this.client.provider.set(msg.guild, 'customCommands', customCommands);
			return msg.reply('Last command removed.');
		}
		else{
			customCommands.splice(customCommands.findIndex(findCommand), 1);
			this.client.provider.set(msg.guild, 'customCommands', customCommands);
			return msg.reply(`\`'${args.name}\` removed.`);
		}
	}
};

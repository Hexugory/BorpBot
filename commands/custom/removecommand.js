const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class RemoveCustomCommand extends commando.Command {
	constructor(client) {
		super(client, {
			aliases: ['removec'],
			name: 'removecommand',
			group: 'custom',
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
			return msg.member.permissions.has('MANAGE_MESSAGES');
		}
	}

	async run(msg, args) {
		function findCommand(element){return element.name === args.name};
		let customCommands = this.client.provider.get(msg.guild, 'customCommands', []);
		let foundCommand = customCommands.findIndex(findCommand);
		if(args.name === 0){
			customCommands.length -= 1;
			this.client.provider.set(msg.guild, 'customCommands', customCommands);
			return msg.reply('Last command removed.');
		}
		else{
			if(foundCommand > -1 && customCommands.length > 0){
				customCommands.splice(foundCommand, 1);
				this.client.provider.set(msg.guild, 'customCommands', customCommands);
				return msg.reply(`\`${this.client.provider.get(msg.guild, 'prefix', this.client.commandPrefix)}${args.name}\` removed.`);
			}
			else{
				return msg.reply(`Command not found.`);
			}
		}
	}
};

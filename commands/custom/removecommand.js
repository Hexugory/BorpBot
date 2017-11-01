const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class RemoveCustomCommand extends commando.Command {
	constructor(client) {
		super(client, {
			aliases: ['removec'],
			name: 'removecommand',
			group: 'custom',
			memberName: 'removecommand',
			description: 'Removes all specified custom commands. `removecommand last` will remove the last command. (Manage Messages)',
			examples: ['\'removecommand sumirekt'],
			guildOnly: true,

			args: [
				{
					key: 'name',
					label: 'name',
					prompt: 'Enter the command name.',
					type: 'string',
					infinite: true
				}
			]
		});
	}
	
	hasPermission(msg) {
		return msg.client.isOwner(msg.author) || (msg.guild && msg.member.permissions.has('MANAGE_MESSAGES'))
	}

	async run(msg, args) {
		let sendstr = "\n";
		let customCommands = msg.client.provider.get(msg.guild, 'customCommands', []);
		if(args.name[0] === 'last'){
			customCommands.length -= 1;
			msg.client.provider.set(msg.guild, 'customCommands', customCommands);
			return msg.reply('Last command removed.');
		}
		else{
			for(var i = 0; i < args.name.length; i++){
				let foundCommand = customCommands.findIndex(function(element){return element.name === args.name[i]});
				if(foundCommand > -1 && customCommands.length > 0){
					customCommands.splice(foundCommand, 1);
					sendstr += `\`${this.client.provider.get(msg.guild, 'prefix', this.client.commandPrefix)}${args.name[i]}\`: 👍\n`;
				}
				else{
					sendstr += `\`${this.client.provider.get(msg.guild, 'prefix', this.client.commandPrefix)}${args.name[i]}\`: Command not found.\n`;
				}
			}
			msg.client.provider.set(msg.guild, 'customCommands', customCommands);
			return msg.reply(sendstr);
		}
	}
};

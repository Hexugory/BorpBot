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
		let roles = msg.member.roles.cache.array();
		let permissions = msg.client.provider.get(msg.guild, 'permissions', {custom:[]});
		if(!permissions.custom){
			return msg.client.isOwner(msg.author);
		}
		else if(permissions.custom.length < 1){
			return msg.client.isOwner(msg.author);
		}
		else{
			for(var i = 0; i < roles.length; i++){
				if(permissions.custom.includes(roles[i].id)){
					return true;
				}
			}
			return msg.client.isOwner(msg.author);
		}
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
			if(sendstr.length > 1999){
				var messageBuffer = new Buffer(sendstr, 'utf-8')
				return msg.reply({files: [{attachment: messageBuffer,name: `result.txt`}]})
			}
			else{
				return msg.reply(sendstr)
			}
		}
	}
};

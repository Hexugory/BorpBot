const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class EditCustomCommand extends commando.Command {
	constructor(client) {
		super(client, {
			aliases: ['editc'],
			name: 'editcommand',
			group: 'custom',
			memberName: 'editcommand',
			description: 'Edits a specified custom command. Essentially a shortcut for removecommand and newcommand. (Manage Messages)',
			examples: ['\'editcommand sumirekt sumishrekt http://i.imgur.com/No0PVAX.png'],
			guildOnly: true,

			args: [
				{
					key: 'name',
					label: 'name',
					prompt: 'Name of the command you\'re editing.',
					type: 'string'
				},
				{
					key: 'new',
					label: 'newname',
					prompt: 'New name of the command you\'re editing.',
					type: 'string'
				},
				{
					key: 'out',
					label: 'output',
					prompt: 'New output of the command you\'re editing.',
					type: 'string'
				}
			]
		});
	}
	
	hasPermission(msg) {
		return msg.client.isOwner(msg.author) || (msg.guild && msg.member.permissions.has('MANAGE_MESSAGES'))
	}

	async run(msg, args) {
		function findCommand(element){return element.name === args.name};
		let customCommands = this.client.provider.get(msg.guild, 'customCommands', []);
		let foundCommand = customCommands.findIndex(findCommand)
		if(foundCommand > -1 && customCommands.length > 0){
			if(args.new.includes('`') || msg.client.registry.findCommands(args.new)[0] != undefined){
				return msg.reply('You have entered an invalid command name.');
			}
			else{
				let prefix = this.client.provider.get(msg.guild, 'prefix', this.client.commandPrefix)
				customCommands[foundCommand] = {name: args.new, output: args.out}
				this.client.provider.set(msg.guild, 'customCommands', customCommands);
				return msg.reply(`\`${prefix}${args.name}\` changed to \`${prefix}${args.new}\`.`);
			}
		}
		else{
			return msg.reply(`Command not found.`);
		}
	}
};

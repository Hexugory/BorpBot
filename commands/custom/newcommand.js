const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class NewCustomCommand extends commando.Command {
	constructor(client) {
		super(client, {
			aliases: ['newc'],
			name: 'newcommand',
			group: 'custom',
			memberName: 'newcommand',
			description: 'Adds a custom command.',
			guildOnly: true,
			throttling:{usages:1, duration:20},
			examples: ['\'newcommand sumirekt http://i.imgur.com/yUKLbuc.jpg'],

			args: [
				{
					key: 'name',
					label: 'name',
					prompt: 'Enter command input.',
					type: 'string'
				},
				{
					key: 'out',
					label: 'output',
					prompt: 'Enter command output',
					type: 'string'
				}
			]
		});
	}
	
	hasPermission(msg) {
		return msg.client.isOwner(msg.author) || (msg.guild && (msg.member.permissions.has('MANAGE_MESSAGES') || msg.client.provider.get(msg.guild, 'memeChannelIDs', []).includes(msg.channel.id)))
	}

	async run(msg, args) {
		function findCommand(element){return element.name === args.name};
		let customCommands = this.client.provider.get(msg.guild, 'customCommands', []);
		if(args.name.includes('`') || args.name.includes(' ') || msg.client.registry.findCommands(args.name)[0] != undefined){
			return msg.reply('You have entered an invalid command name.');
		}
		else{
			if(customCommands.findIndex(findCommand) > -1){
				return msg.reply("There's already a command with that name.");
			}
			else if(args.name === args.out){
				return msg.reply("Why would you want a command like that?");
			}
			else{
				this.client.provider.set(msg.guild, 'undone', false);
				customCommands.push({
					name: args.name,
					output: args.out
				});
				this.client.provider.set(msg.guild, 'customCommands', customCommands);
				return msg.reply(`\`${this.client.provider.get(msg.guild, 'prefix', this.client.commandPrefix)}${args.name}\` added. Undo mistakes with \`'undo\`.`);
			}
		}
	}
};

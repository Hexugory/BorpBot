const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const mMessages = require('../../perms.js').mMessages;

module.exports = class NewCustomCommand extends commando.Command {
	constructor(client) {
		super(client, {
			aliases: ['newc'],
			name: 'newcommand',
			group: 'meme',
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
		function findCommand(element){return element.name === args.name};
		let customCommands = this.client.provider.get(msg.guild, 'customCommands', []);
		if(args.name.includes('`') || msg.client.registry.findCommands(args.name)[0] != undefined){
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
				return msg.reply(`\`'${args.name}\` added. Undo mistakes with \`'undo\`.`);
			}
		}
	}
};

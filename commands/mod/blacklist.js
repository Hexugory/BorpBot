const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class BlacklistCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'blacklist',
			group: 'mod',
			memberName: 'blacklist',
			description: 'Adds the mentioned user to the specified blacklist. (Manage Roles)',
			details: oneLine`
			Prevents a user from using a specific set of commands.
			A command or a command group can be specified.
			You can also blacklist them from all commands in the server with "server".
			`,
			//` good syntax highlighting notepad++
			examples: ['\'blacklist x @Guy Hero#1823'],
			guildOnly: true,

			args: [
				{
					key: 'bc',
					label: 'bc',
					prompt: 'Specify blacklist.',
					type: 'string'
				},
				{
					key: 'user',
					label: 'mention',
					prompt: 'Specify user.',
					type: 'user'
				}
			]
		});
	}
	
	hasPermission(msg) {
		return msg.client.isOwner(msg.author) || (msg.member && msg.member.permissions.has('MANAGE_ROLES'));
	}

	async run(msg, args) {
		//check for a valid argument
		if(['server'].includes(args.bc) || msg.client.registry.findCommands(args.bc, true)[0] != undefined || msg.client.registry.findGroups(args.bc, true)[0] != undefined){
			var list = this.client.provider.get(msg.guild, 'blacklist', {});
			if(!Array.isArray(list[args.bc])){
				list[args.bc] = [];
			}
			if(list[args.bc].includes(msg.author.id) && !msg.client.isOwner(msg.author)){
				return msg.reply("You are in this blacklist, you cannot manipulate it.");
			}
			else{
				//check if the target isnt already in the list
				if(!list[args.bc].includes(args.user.id)){
					list[args.bc].push(args.user.id);
					this.client.provider.set(msg.guild, 'blacklist', list);
					return msg.channel.send(`${args.user} added to **${args.bc}** blacklist.`);
				}
				else{
					list[args.bc].splice(list[args.bc].indexOf(args.user.id), 1);
					this.client.provider.set(msg.guild, 'blacklist', list);
					return msg.channel.send(`${args.user} removed from **${args.bc}** blacklist.`);
				}
			}
		}
		else{
			return msg.channel.send(`**${args.bc}** blacklist does not exist.`);
		}
	};
}
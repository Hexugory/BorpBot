const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class BlacklistCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'blacklist',
			group: 'util',
			memberName: 'blacklist',
			description: 'Adds the mentioned user to the specified blacklist. (Manage Roles)',
			details: oneLine`
			Prevents a user from using a specific set of commands.
			The current sets that you can blacklist are "command" for custom command creation,
			"x" for preventing from placing :x: reactions for embed deletion.
			and "duel" to prevent use of \`'duel\`.
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
		if(msg.client.isOwner(msg.author)){
			return true;
		}
		else{
			return msg.member.permissions.has('MANAGE_ROLES');
		}
	}

	async run(msg, args) {
		//check for a valid argument
		if(['command', 'x', 'server', 'duel', 'suggest'].includes(args.bc)){
			if(msg.client.provider.get(msg.guild, args.bc + 'BlacklistIDs', []).includes(msg.author.id) && !msg.client.isOwner(msg.author)){
				return msg.reply("You are in this blacklist, you cannot manipulate it.");
			}
			else{
				let list = this.client.provider.get(msg.guild, args.bc + 'BlacklistIDs', []);
				//check if the target isnt already in the list
				if(!list.includes(args.user.id)){
					list.push(args.user.id);
					this.client.provider.set(msg.guild, args.bc + 'BlacklistIDs', list);
					return msg.channel.send(`${args.user} added to **${args.bc}** blacklist.`);
				}
				else{
					list.splice(list.indexOf(args.user.id), 1);
					this.client.provider.set(msg.guild, args.bc + 'BlacklistIDs', list);
					return msg.channel.send(`${args.user} removed from **${args.bc}** blacklist.`);
				}
			}
		}
	};
}
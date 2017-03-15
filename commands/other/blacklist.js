const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const mRoles = require('../../perms.js').mRoles;

module.exports = class BlacklistCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'blacklist',
			group: 'util',
			memberName: 'blacklist',
			description: 'Adds the mentioned user to the specified blacklist.',
			examples: ['\'setchannel voice'],
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
			return msg.member.hasPermission(mRoles);
		}
	}

	async run(msg, args) {
		//check for a valid argument
		if(['command'].indexOf(args.bc) > -1){
			//hello fishy
			if(msg.client.provider.get(msg.guild, args.bc + 'BlacklistIDs', []).indexOf(msg.author.id) != -1){
				return msg.reply("You are in this blacklist, you cannot manipulate it.");
			}
			else{
				let list = this.client.provider.get(msg.guild, args.bc + 'BlacklistIDs', []);
				//check if the target isnt already in the list
				if(list.indexOf(args.user.id) === -1){
					list.push(args.user.id);
					this.client.provider.set(msg.guild, args.bc + 'BlacklistIDs', list);
					return msg.channel.sendMessage(`${args.user} added to **${args.bc}**.`);
				}
				else{
					list.splice(list.indexOf(args.user.id), 1);
					this.client.provider.set(msg.guild, args.bc + 'BlacklistIDs', list);
					return msg.channel.sendMessage(`${args.user} removed from **${args.bc}**.`);
				}
			}
		}
	};
}
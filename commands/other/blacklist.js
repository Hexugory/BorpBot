const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const mRoles = require('../../perms.js').mRoles;

module.exports = class AnnounceToggleCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'blacklist',
			group: 'other',
			memberName: 'blacklist',
			description: 'Adds the mentioned user to the specified blbcklist.',
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
					type: 'string'
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
			if(msg.client.provider.get(msg.guild, args.bc + 'BlacklistIDs', []).indexOf(msg.channel.id) != -1){
				return msg.reply("You are in this blacklist, you cannot manipulate it.");
			}
			else{
				args.user = args.user.slice(2, 20);
				//is the user in the server
				msg.guild.fetchMember(args.user).then((user) => {
					if(user === undefined){
						return msg.reply("Invalid user.");
					}
					else{
						let list = this.client.provider.get(msg.guild, args.bc + 'BlacklistIDs', []);
						//check if the target isnt already in the list
						if(list.indexOf(args.user) === -1){
							list.push(args.user);
							this.client.provider.set(msg.guild, args.bc + 'BlacklistIDs', list);
							return msg.channel.sendMessage(`${msg.guild.members.get(args.user)} added to **${args.bc}**.`);
						}
						else{
							list.splice(list.indexOf(args.user), 1);
							this.client.provider.set(msg.guild, args.bc + 'BlacklistIDs', list);
							return msg.channel.sendMessage(`${msg.guild.members.get(args.user)} removed from **${args.bc}**.`);
						}
					}
				});
			}
		}
	};
}
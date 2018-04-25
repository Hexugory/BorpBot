const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class ClearNominationsCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'clearnominations',
			group: 'suggestion',
			memberName: 'clearnominations',
			description: 'Clears nominations.',
			examples: ['\'clearnominations'],
			guildOnly: true
		});
	}

	hasPermission(msg) {
		let roles = msg.member.roles.array();
		let permissions = msg.client.provider.get(msg.guild, 'permissions', {suggest:[]});
		if(!permissions.suggest){
			return msg.client.isOwner(msg.author);
		}
		else if(permissions.suggest.length < 1){
			return msg.client.isOwner(msg.author);
		}
		else{
			for(var i = 0; i < roles.length; i++){
				if(permissions.suggest.includes(roles[i].id)){
					return true;
				}
			}
			return msg.client.isOwner(msg.author);
		}
	}

	async run(msg, args) {
		msg.client.provider.set(msg.guild, 'nominees', {});
		return msg.reply("Nominations cleared.");
	};
}
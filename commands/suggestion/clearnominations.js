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
			description: oneLine`Clears nominations.
			\`'clearnominations\` will clear all nominations.
			\`'clearnominations [member]\` will clear only that member's nominations.`,
			examples: ['\'clearnominations', '\'clearnominations @Guy Hero#7991'],
			guildOnly: true,

			args: [
				{
					key: 'mb',
					label: 'member',
					prompt: 'Please enter a member.',
					type: 'member',
					default: 0
				}
			]
		});
	}

	hasPermission(msg) {
		let roles = msg.member.roles.cache.array();
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
		if(!args.mb){
			msg.client.provider.set(msg.guild, 'nominees', {});
			return msg.reply("Nominations cleared.");
		}
		let nominees = msg.client.provider.get(msg.guild, 'nominees', {});
		for(const nominee in nominees){
			if(nominees[nominee].nominators.includes(args.mb.id)){
				nominees[nominee].nominators.splice(nominees[nominee].nominators.indexOf(args.mb.id), 1);
				for(const input in nominees[nominee].inputs){
					if(input === args.mb.id) delete nominees[nominee].inputs[input];
				}
			}
			if(!nominees[nominee].nominators.length) delete nominees[nominee];
		}
		return msg.reply(`\`${args.mb.user.username}\`'s nominations cleared.`);
		msg.client.provider.set(msg.guild, 'nominees', nominees);
	};
}
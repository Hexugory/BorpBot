const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class ViewSenderCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'viewsender',
			group: 'suggestion',
			memberName: 'viewsender',
			description: oneLine`View the sender of a suggestion using it's index. (Manage Messages)`,
			examples: ['\'viewsender 5'],
			guildOnly: true,

			args: [
				{
					key: 'id',
					label: 'index',
					prompt: 'Please enter a suggestion index.',
					type: 'integer'
				}
			]
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
		let suggestions = this.client.provider.get(msg.guild, 'suggestions', []);
		let suggestionIndex = suggestions.findIndex(function(element){return element.id == args.id});
		if(!suggestions[suggestionIndex]){
			msg.reply("That suggestion does not exist.");
		}
		else{
			msg.reply(`<@${suggestions[suggestionIndex].user}> sent this suggestion.\nThey have been notified of their name being viewed.`);
			msg.guild.fetchMember(suggestions[suggestionIndex].user).then(sender => {
				sender.send(`The staff of ${msg.guild.name} have requested your name on one of your suggestions.`)
			});
		}
	};
}
const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class RemoveSuggestionCommand extends commando.Command {
	constructor(client) {
		super(client, {
			aliases: ['removesuggest'],
			name: 'removesuggestion',
			group: 'suggestion',
			memberName: 'removesuggestion',
			description: oneLine`Remove a suggestion using it's index. (Manage Messages)`,
			examples: ['\'removesuggestion 5'],
			guildOnly: true,

			args: [
				{
					key: 'id',
					label: 'id',
					prompt: 'Please enter a suggestion ID.',
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
		var suggestions = this.client.provider.get(msg.guild, 'suggestions', []);
		var suggestionIndex = suggestions.findIndex(function(element){return element.id == args.id});
		if(!suggestions[suggestionIndex]){
			msg.reply("That suggestion does not exist.");
		}
		else{
			suggestions.splice(suggestionIndex, 1);
			this.client.provider.set(msg.guild, 'suggestions', suggestions);
			msg.channel.send(`Suggestion removed.`);
		}
	};
}
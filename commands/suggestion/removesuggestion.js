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
			description: oneLine`Remove a suggestion using it's ID. (Manage Messages)`,
			examples: ['\'removesuggestion 4993818925491862'],
			guildOnly: true,

			args: [
				{
					key: 'id',
					label: 'id',
					prompt: 'Please enter a suggestion ID.',
					type: 'integer',
					infinite: true
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
		var sendstr = "\n";
		var suggestions = this.client.provider.get(msg.guild, 'suggestions', []);
		for(var i = 0; i < args.id.length; i++){
			let suggestionIndex = suggestions.findIndex(element => {return element.id == args.id[i]});
			if(!suggestions[suggestionIndex]) sendstr += `${args.id[i]}: That suggestion does not exist.\n`;
			else{
				suggestions.splice(suggestionIndex, 1);
				sendstr += `${args.id[i]}: 👍\n`;
			}
		}
		this.client.provider.set(msg.guild, 'suggestions', suggestions);
		return msg.reply(sendstr);
	};
}
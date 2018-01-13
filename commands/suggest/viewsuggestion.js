const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class ViewSuggestionCommand extends commando.Command {
	constructor(client) {
		super(client, {
			aliases: ['viewsuggest'],
			name: 'viewsuggestion',
			group: 'suggest',
			memberName: 'viewsuggestion',
			description: oneLine`View a suggestion using it's index. (Manage Messages)`,
			examples: ['\'viewsuggestion 5'],
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
			var fetched = await msg.guild.fetchMember(suggestions[suggestionIndex].user)
			var name = fetched ? fetched.user.username : "[Not Found]"
			var fromstr = suggestions[suggestionIndex].anonymous ? "[Anonymous]" : name;
			msg.channel.send(`${fromstr} suggested: ${suggestions[suggestionIndex].suggestion}`);
		}
	};
}
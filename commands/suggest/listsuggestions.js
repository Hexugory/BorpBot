const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class ListSuggestionsCommand extends commando.Command {
	constructor(client) {
		super(client, {
			aliases: ['listsuggest'],
			name: 'listsuggestions',
			group: 'suggestion',
			memberName: 'listsuggestions',
			description: oneLine`List all full suggestions along with the ID and who submitted it (If they're not anonymous.). (Manage Messages)`,
			examples: ['\'listsuggestions'],
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
		var suggestions = this.client.provider.get(msg.guild, 'suggestions', []);
		var sendstr = "";
		for(var i = 0; i < suggestions.length; i++){
			var fetched = await msg.guild.members.fetch(suggestions[i].user)
			var name = fetched ? fetched.user.username : "[Not Found]"
			var fromstr = suggestions[i].anonymous ? "[Anonymous]" : `${name}`;
			sendstr += `${fromstr} suggested: ${suggestions[i].suggestion}\nSuggestion ID: ${suggestions[i].id}\n`
		}
		if(sendstr.length > 1999){
			var messageBuffer = new Buffer(sendstr, 'utf-8')
			msg.channel.send({files: [{attachment: messageBuffer,name: `result.txt`}]})
		}
		else{
			msg.channel.send(sendstr)
		}
	};
}
const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class ListSuggestionsCommand extends commando.Command {
	constructor(client) {
		super(client, {
			aliases: ['listsuggest'],
			name: 'listsuggestions',
			group: 'suggest',
			memberName: 'listsuggestions',
			description: oneLine`List all suggestion indexes and the person who submitted them (If they're not anonymous.).
			\`'listsuggestions full\` will list all full suggestions along with the index and who submitted it. (Manage Messages)`,
			examples: ['\'listsuggestions', '\'listsuggestions full'],

			args: [
				{
					key: 'fl',
					label: 'full',
					default: 'a',
					prompt: 'Full list or no?',
					type: 'string'
				}
			]
		});
	}
	
	hasPermission(msg) {
		return msg.client.isOwner(msg.author) || (msg.member && msg.member.permissions.has('MANAGE_MESSAGES'));
	}

	async run(msg, args) {
		var suggestions = this.client.provider.get(msg.guild, 'suggestions', []);
		var sendstr = "";
		if(args.fl.toLowerCase() != 'full'){
			for(var i = 0; i < suggestions.length; i++){
				var fromstr = suggestions[i].anonymous ? "[Anonymous]" : `<@${suggestions[i].user}>`;
				sendstr += `${fromstr}: ${i}, `
			}
		}
		else{
			for(var i = 0; i < suggestions.length; i++){
				var fromstr = suggestions[i].anonymous ? "[Anonymous]" : `<@${suggestions[i].user}>`;
				sendstr += `${fromstr} suggested: ${suggestions[i].suggestion}\nSuggestion index: ${i}\n`
			}
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
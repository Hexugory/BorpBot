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
		return msg.client.isOwner(msg.author) || (msg.member && msg.member.permissions.has('MANAGE_MESSAGES'));
	}

	async run(msg, args) {
		var suggestions = this.client.provider.get(msg.guild, 'suggestions', []);
		if(suggestions[args.id] === undefined){
			msg.reply("That suggestion does not exist.");
		}
		else{
			var fromstr = suggestions[args.id].anonymous ? "[Anonymous]" : `<@${suggestions[args.id].user}>`;
			msg.channel.send(`${fromstr} suggested: ${suggestions[args.id].suggestion}`);
		}
	};
}
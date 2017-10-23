const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class RemoveSuggestionCommand extends commando.Command {
	constructor(client) {
		super(client, {
			aliases: ['removesuggest'],
			name: 'removesuggestion',
			group: 'suggest',
			memberName: 'removesuggestion',
			description: oneLine`Remove a suggestion using it's index. (Manage Messages)`,
			examples: ['\'removesuggestion 5'],

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
			suggestions.splice(args.id, 1);
			this.client.provider.set(msg.guild, 'suggestions', suggestions);
			msg.channel.send(`Suggestion #${args.id} removed.`);
		}
	};
}
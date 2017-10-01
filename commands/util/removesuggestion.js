const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class RemoveSuggestionCommand extends commando.Command {
	constructor(client) {
		super(client, {
			aliases: ['removesuggest'],
			name: 'removesuggestion',
			group: 'util',
			memberName: 'removesuggestion',
			description: oneLine`Remove a suggestion using it's id. (Manage Messages)`,
			examples: ['\'removesuggestion 5'],

			args: [
				{
					key: 'id',
					label: 'id',
					prompt: 'Please enter a suggestion id.',
					type: 'integer'
				}
			]
		});
	}
	
	hasPermission(msg) {
		if(msg.client.isOwner(msg.author)){
			return true;
		}
		else{
			return msg.member.permissions.has('MANAGE_MESSAGES')
		}
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
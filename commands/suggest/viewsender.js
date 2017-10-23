const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class ViewSenderCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'viewsender',
			group: 'suggest',
			memberName: 'viewsender',
			description: oneLine`View the sender of a suggestion using it's index. (Manage Messages)`,
			examples: ['\'viewsender 5'],

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
			msg.reply(`<@${suggestions[args.id].user}> sent this suggestion.\nThey have been notified of their name being viewed.`);
			msg.guild.fetchMember(suggestions[args.id].user).then(sender => {
				sender.send(`The staff of ${msg.guild.name} have requested your name on one of your suggestions.`)
			});
		}
	};
}
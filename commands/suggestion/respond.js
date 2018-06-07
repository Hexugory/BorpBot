const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class RespondCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'respond',
			group: 'suggestion',
			memberName: 'respond',
			description: oneLine`View the sender of a suggestion using it's ID. (Manage Messages)`,
			examples: ['\'viewsender 5'],
			guildOnly: true,

			args: [
				{
					key: 'id',
					label: 'id',
					prompt: 'Please enter a suggestion ID.',
					type: 'integer'
				},
				{
					key: 'msg',
					label: 'message',
					prompt: 'Please enter a message.',
					validate: text => {return text.length < 1900},
					type: 'string'
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
		if(!suggestions[suggestionIndex]) return msg.reply("That suggestion does not exist.");
		msg.reply("Message sent.");
		msg.guild.members.fetch(suggestions[suggestionIndex].user).then(sender => {
			return sender.send(`The staff of ${msg.guild.name} have responded to one of your suggestions.
Your name has not been viewed.
"${args.msg}"`);
		});
	};
}
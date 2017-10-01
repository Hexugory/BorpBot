const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class SuggestCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'suggest',
			group: 'util',
			memberName: 'suggest',
			description: oneLine`Sends a suggestion to the staff for future viewing.
			Can send anonymously. However if you do send anonymously, the staff can view who you are, but you will be notified if they do so.
			Can only be used in DMs.
			Reccomended that you only send "'suggest".
			You can send all of the arguments in one message, but only do so if you know what you're doing.
			Suggestions are limited to 1900 characters.
			Joke suggestions may lead to being blacklisted and/or other mod action.`,
			examples: ['\'suggest'],

			args: [
				{
					key: 'gi',
					label: 'server name',
					prompt: 'Please enter a server name.',
					type: 'guild'
				},
				{
					key: 'an',
					label: 'anonymous yes/no',
					prompt: 'Do you want to send anonymously? [y/n]',
					type: 'boolean'
				},
				{
					key: 'sg',
					label: 'suggestion',
					prompt: 'Please enter a suggestion.',
					type: 'string'
				}
			]
		});
	}

	async run(msg, args) {
		function sendMessages(arr, content){
			for(var i = 0; i < arr.length; i++){
				try{
					msg.client.channels.get(arr[i]).send(content)
				}
				catch(err){console.log(err)}
			}
		};
		if(msg.channel.guild != undefined){
			msg.author.send(`You can only use 'suggest in DMs.\nPlease use \`'help suggest\`.`);
		}
		else{
			var suggestionChannels = this.client.provider.get(args.gi, 'suggestionChannelIDs', false);
			if(!suggestionChannels){
				msg.reply("That server does not have suggestions enabled.");
			}
			else{
				args.gi.fetchMember(msg.author).then(author => {
				if(this.client.provider.get(args.gi, 'suggestBlacklistIDs', []).includes(msg.author.id)
				|| this.client.provider.get(args.gi, 'serverBlacklistIDs', []).includes(msg.author.id)
				|| author === undefined){
					msg.reply("You cannot suggest to that server.");
				}
				else{
					if(args.sg.length > 1900){
						msg.reply("Your suggestion cannot be longer than 1900 characters.");
					}
					else{
						var suggestions = this.client.provider.get(args.gi, 'suggestions', []);
						var fromstr = args.an ? "[Anonymous]" : msg.author.toString();
						sendMessages(suggestionChannels, `${fromstr} suggested: ${args.sg}\nSuggestion index: ${suggestions.length}`);
						suggestions.push({
							suggestion: args.sg,
							user: msg.author.id,
							anonymous: args.an
						});
						this.client.provider.set(args.gi, 'suggestions', suggestions);
						msg.reply("Suggestion sent.");
					}
				}
				});
			}
		}
	};
}
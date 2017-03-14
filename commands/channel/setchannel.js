const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const mChannels = require('../../perms.js').mChannels;

module.exports = class AnnounceToggleCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'setchannel',
			group: 'channel',
			memberName: 'setchannel',
			description: 'Adds the channel to the specified automated action.',
			examples: ['\'setchannel voice'],

			args: [
				{
					key: 'ac',
					label: 'ac',
					prompt: 'What\'s supposed to be announced to the channel.',
					type: 'string'
				}
			]
		});
	}
	
	hasPermission(msg) {
		if(msg.client.isOwner(msg.author)){
			return true;
		}
		else{
			//manage channels
			return msg.member.hasPermission(mChannels);
		}
	}

	async run(msg, args) {
		//check for a valid argument
		if(['voice', 'x', 'meme'].find(function(element){return element === args.ac}) != undefined){
			let list = this.client.provider.get(msg.guild, args.ac + 'ChannelIDs', []);
			//check if the channel isnt already in the list
			if(list.find(function(element){return element === msg.channel.id}) === undefined){
				list.push(msg.channel.id);
				this.client.provider.set(msg.guild, args.ac + 'ChannelIDs', list);
				return msg.reply(`${msg.channel} added to **${args.ac}**.`);
			}
			else{
				list.splice(list.findIndex(function(element){return element === msg.channel.id}), 1);
				this.client.provider.set(msg.guild, args.ac + 'ChannelIDs', list);
				return msg.reply(`${msg.channel} removed from **${args.ac}**.`);
			}
		}
	}
};

const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const mChannels = require('../../perms.js').mChannels;

module.exports = class SetChannelCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'setchannel',
			group: 'channel',
			memberName: 'setchannel',
			description: 'Adds the channel to the specified automated action. (Manage Channels)',
			examples: ['\'setchannel voice'],
			guildOnly: true,

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
			return msg.member.hasPermission(mChannels);
		}
	}

	async run(msg, args) {

		//check for a valid argument
		if(['voice', 'x', 'meme'].includes(args.ac)){
			let list = this.client.provider.get(msg.guild, args.ac + 'ChannelIDs', []);
			//check if the channel isnt already in the list
			if(!list.includes(msg.channel.id)){
				list.push(msg.channel.id);
				this.client.provider.set(msg.guild, args.ac + 'ChannelIDs', list);
				return msg.channel.sendMessage(`${msg.channel} added to **${args.ac}**.`);
			}
			else{
				list.splice(list.indexOf(msg.channel.id), 1);
				this.client.provider.set(msg.guild, args.ac + 'ChannelIDs', list);
				return msg.channel.sendMessage(`${msg.channel} removed from **${args.ac}**.`);
			}
		}
	}
};

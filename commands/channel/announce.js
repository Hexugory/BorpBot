const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');

module.exports = class AnnounceToggleCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'announce',
			group: 'channel',
			memberName: 'announce',
			description: 'Adds the current channel to the specified announcer.',
			examples: ['\'announce voice'],

			args: [
				{
					key: 'announcer',
					label: 'announcer',
					prompt: 'What\'s supposed to be announced to the channel.',
					type: 'string'
				}
			]
		});
	}
	
	hasPermission(msg) {
		return msg.member.hasPermission(16);
	}

	async run(msg, args) {
		if(['voice'].find(function(element){return element === args.announcer}) != undefined){
			let list = this.client.provider.get(msg.guild, args.announcer + 'AnnounceIDs', []);
			if(list.find(function(element){return element === msg.channel.id}) === undefined){
				list.push(msg.channel.id);
				this.client.provider.set(msg.guild, args.announcer + 'AnnounceIDs', list);
				return msg.reply(`${msg.channel} added to **${args.announcer}**.`);
			}
			else{
				list.splice(list.findIndex(function(element){return element === msg.channel.id}), 1);
				this.client.provider.set(msg.guild, args.announcer + 'AnnounceIDs', list);
				return msg.reply(`${msg.channel} removed from **${args.announcer}**.`);
			}
		}
	}
};

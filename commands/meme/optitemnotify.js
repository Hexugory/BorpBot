const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class OptItemNotifyCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'optitemnotify',
			group: 'meme',
			memberName: 'optitemnotify',
			description: 'Toggle notifications for when you get items.',
			examples: ['\'optitemnotify'],
			guildOnly: true
		});
	}
	

	async run(msg, args) {
		var optlist = this.client.provider.get(msg.guild, 'optlist', []);
		if(!optlist.includes(msg.author.id)){
			optlist.push(msg.author.id);
			this.client.provider.set(msg.guild, 'optlist', optlist);
			return msg.reply(`You will now be notified when you get an item.`);
		}
		else{
			optlist.splice(optlist.indexOf(msg.author.id), 1);
			this.client.provider.set(msg.guild, 'optlist', optlist);
			return msg.reply(`You will no longer be notified when you get an item.`);
		}
	}
};

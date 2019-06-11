const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class OptItemNotifyCommand extends commando.Command {
	constructor(client) {
		super(client, {
			aliases: ['fuckurdad'],
			name: 'optrollnotify',
			group: 'gacha',
			memberName: 'optrollnotify',
			description: 'Toggle notifications for when you get rolls.',
			examples: ['\'optrollnotify'],
			guildOnly: true
		});
	}

	hasPermission(msg) {
		return msg.client.isOwner(msg.author) || (msg.guild  && msg.guild.id === "163175631562080256" && (msg.member.permissions.has('MANAGE_MESSAGES') || msg.client.provider.get(msg.guild, 'memeChannelIDs', []).includes(msg.channel.id)))
	}

	async run(msg, args) {
		var optlist = this.client.provider.get(msg.guild, 'optgachalist', []);
		if(!optlist.includes(msg.author.id)){
			optlist.push(msg.author.id);
			this.client.provider.set(msg.guild, 'optgachalist', optlist);
			return msg.reply(`You will now be notified when you get a roll.`);
		}
		else{
			optlist.splice(optlist.indexOf(msg.author.id), 1);
			this.client.provider.set(msg.guild, 'optgachalist', optlist);
			return msg.reply(`You will no longer be notified when you get a roll.`);
		}
	}
};

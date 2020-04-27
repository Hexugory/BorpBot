const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const { MessageEmbed } = require('discord.js');

module.exports = class ClaimCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'claim',
			aliases: ['c'],
			group: 'gacha',
			memberName: 'claim',
			description: 'Memes for the meme gods.\nExclusive to Touhou Discord.',
			examples: ['\'claim Guy Hero', '\'c Guy Hero'],
			guildOnly: true,

			args: [
				{
					key: 'username',
					label: 'username',
					prompt: 'Specify username.',
					type: 'string'
				}
			]
		});
	}

	hasPermission(msg) {
		return msg.client.isOwner(msg.author) || (msg.channel && msg.channel.id === "372835728574382090")
	}

	async run(msg, args) {
		if(!msg.channel.drop) return msg.reply('There\'s no drop here.');
		if(args.username.toLowerCase() != msg.channel.drop.username.toLowerCase()) return msg.reply('Incorrect!');
		var gacha = msg.client.provider.get(msg.guild, "gacha"+msg.author.id, {rolls:0,spirits:[]});
		gacha.spirits.push(msg.channel.drop.id);
		msg.client.provider.set(msg.guild, "gacha"+msg.author.id, gacha)
		var returnEmbed = new MessageEmbed()
			.setTitle(`You got: ${msg.channel.drop.tag}!`)
			.setImage(msg.channel.drop.avatar);
		delete msg.channel.drop;
		return msg.reply(returnEmbed);
	}
};

const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const { MessageEmbed } = require('discord.js');

module.exports = class RollGachaCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'rollgacha',
			aliases: ['roll'],
			group: 'gacha',
			memberName: 'rollgacha',
			description: 'Roll the meme gacha.\nExclusive to Touhou Discord.',
			examples: ['\'rollgacha'],
			guildOnly: true
		});
	}

	hasPermission(msg) {
		return msg.client.isOwner(msg.author) || (msg.guild  && msg.guild.id === "163175631562080256" && (msg.member.permissions.has('MANAGE_MESSAGES') || msg.client.provider.get(msg.guild, 'memeChannelIDs', []).includes(msg.channel.id)))
	}

	async run(msg, args) {
		var gacha = msg.client.provider.get(msg.guild, "gacha"+msg.author.id, {rolls:0,spirits:[]});
		if(gacha.rolls < 1) return msg.reply('You dont have any rolls.');
		var fullMemberList = await msg.guild.members.fetch();
		var gachaGuy = fullMemberList.random();
		gacha.spirits.unshift(gachaGuy.user.id);
		gacha.rolls--;
		msg.client.provider.set(msg.guild, "gacha"+msg.author.id, gacha)
		var returnEmbed = new MessageEmbed()
			.setTitle(`You got: ${gachaGuy.user.tag}!`)
			.setImage(gachaGuy.user.avatarURL());
		return msg.reply(returnEmbed);
	}
};

const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const { MessageEmbed } = require('discord.js');

module.exports = class BuyRollsCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'buyrolls',
			aliases: ['buyroll'],
			group: 'gacha',
			memberName: 'buyrolls',
			description: 'Buy gacha rolls for 6000 BorpDust.\nExclusive to Touhou Discord.',
			examples: ['\'buyroll', '\'buyrolls 20'],
			guildOnly: true,
			
			args: [
				{
					key: 'amount',
					label: 'amount',
					prompt: 'Specify amount.',
					type: 'integer',
					default: 1
				}
			]
		});
	}

	hasPermission(msg) {
		return msg.client.isOwner(msg.author) || (msg.guild  && msg.guild.id === "163175631562080256" && (msg.member.permissions.has('MANAGE_MESSAGES') || msg.client.provider.get(msg.guild, 'memeChannelIDs', []).includes(msg.channel.id)))
	}

	async run(msg, args) {
		var duelstats = msg.client.provider.get(msg.guild, "duelstats", {});
		if(!duelstats[msg.author.id] || duelstats[msg.author.id].borpdust < 6000*args.amount) return msg.reply("You don't have enough BorpDust.");
		duelstats[msg.author.id].borpdust -= 6000*args.amount;
		var gacha = msg.client.provider.get(msg.guild, "gacha"+msg.author.id, {rolls:0,spirits:[]});
		gacha.rolls += args.amount;
		msg.client.provider.set(msg.guild, "gacha"+msg.author.id, gacha);
		msg.client.provider.set(msg.guild, "duelstats", duelstats);
		return msg.reply(`You bought ${args.amount} rolls.`);
	}
};

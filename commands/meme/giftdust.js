const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class GiftDustCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'giftdust',
			group: 'meme',
			memberName: 'giftdust',
			description: 'Gift someone Borpdust.',
			examples: ['\'giftdust @Guy Hero#7991 20'],
			guildOnly: true,
			
			args: [
				{
					key: 'mb',
					label: 'member',
					prompt: 'Specify member.',
					type: 'member'
				},
				{
					key: 'am',
					label: 'amount',
					prompt: 'Specify amount.',
					type: 'integer'
				}
			]
		});
	}

	async run(msg, args) {
		let duelstats = msg.client.provider.get(msg.guild, "duelstats", {});
		if(!duelstats[msg.author.id] || 
		!duelstats[msg.author.id].borpdust || 
		duelstats[msg.author.id].borpdust < args.am) return msg.reply("```diff\n- You don't have enough Borpdust -```");
		else{
			if(!duelstats[args.mb.id]) duelstats[args.mb.id] = {items: [], equipped: [null, null, null], borpdust: 0};
			if(!duelstats[args.mb.id].borpdust) duelstats[args.mb.id].borpdust = args.am;
			else duelstats[args.mb.id].borpdust += args.am;
			duelstats[msg.author.id].borpdust -= args.am;
			msg.client.provider.set(msg.guild, "duelstats", duelstats);
			return msg.reply(`\`\`\`diff\n! Gifted ${args.mb.displayName} ${args.am} Borpdust. !\`\`\``);
		}
	}
};

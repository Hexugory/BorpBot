const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const { MessageEmbed } = require('discord.js');

module.exports = class ListSpiritsCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'listspirits',
			group: 'gacha',
			memberName: 'listspirits',
			description: 'List your gacha spirits.',
			examples: ['\'listspirits', '\'listspirits 2'],
			guildOnly: true,

			args: [
				{
					key: 'page',
					label: 'page',
					prompt: 'Specify page.',
					type: 'integer',
					default: '1'
				}
			]
		});
	}
	
	hasPermission(msg) {
		return msg.client.isOwner(msg.author) || (msg.guild  && msg.guild.id === "163175631562080256" && (msg.member.permissions.has('MANAGE_MESSAGES') || msg.client.provider.get(msg.guild, 'memeChannelIDs', []).includes(msg.channel.id)))
	}

	async run(msg, args) {
		var gacha = msg.client.provider.get(msg.guild, "gacha"+msg.author.id, {rolls:0,spirits:[]});
		var returnEmbed = new MessageEmbed().setTitle(`List (Page ${args.page}/${Math.ceil(gacha.spirits.length/20)})`);
		var description = '';
		var endIndex = gacha.spirits.length-1-20*(args.page-1);
		var startIndex = Math.max(0, endIndex-20)
		for(var i = endIndex; i > startIndex; i--){
			let dude = msg.guild.members.cache.get(gacha.spirits[i])
			dude = dude ? dude : await msg.guild.members.fetch(gacha.spirits[i]).catch(err => {return 'Dead User'});
			if(dude.user) dude = dude.user.tag;
			description += `#${i} ${dude}\n`;
		}
		returnEmbed.setDescription(description)
			.setFooter(`You have ${gacha.rolls} rolls.`);
		return msg.reply(returnEmbed);
	}
};

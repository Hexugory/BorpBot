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
	

	async run(msg, args) {
		var gacha = msg.client.provider.get(msg.guild, "gacha"+msg.author.id, {rolls:0,spirits:[]});
		var returnEmbed = new MessageEmbed().setTitle(`List (Page ${args.page}/${Math.ceil(gacha.spirits.length/20)})`);
		var description = '';
		var startIndex = 0+20*(args.page-1);
		var endIndex = Math.min(gacha.spirits.length, startIndex+20);
		for(var i = startIndex; i < endIndex; i++){
			let dude = await msg.guild.members.fetch(gacha.spirits[i]);
			if(dude) dude = dude.user.tag;
			else dude = 'Dead User';
			description += `${dude}\n`;
		}
		returnEmbed.setDescription(description)
			.setFooter(`You have ${gacha.rolls} rolls.`);
		return msg.reply(returnEmbed);
	}
};

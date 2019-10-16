const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const { MessageEmbed } = require('discord.js');

module.exports = class RollGachaCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'okroen',
			aliases: ['ok'],
			group: 'gacha',
			memberName: 'okroen',
			description: 'roll 10 because roen asked for it. guaranteed one user who\'s posted in the last month.\nExclusive to Touhou Discord.',
			examples: ['\'okroen'],
			guildOnly: true
		});
	}

	hasPermission(msg) {
		return msg.client.isOwner(msg.author) || (msg.guild  && msg.guild.id === "163175631562080256" && (msg.member.permissions.has('MANAGE_MESSAGES') || msg.client.provider.get(msg.guild, 'memeChannelIDs', []).includes(msg.channel.id)))
	}

	async run(msg, args) {
		function randomProperty(obj){
			var keys = Object.keys(obj)
			return obj[keys[ keys.length * Math.random() << 0]];
		};
		function shuffle(array) {
			for (let i = array.length - 1; i > 0; i--) {
				let j = Math.floor(Math.random() * (i + 1));
				[array[i], array[j]] = [array[j], array[i]];
			}
		};
		var activeMembers = client.provider.get('163175631562080256', 'activeMembers', {});
		var gacha = msg.client.provider.get(msg.guild, "gacha"+msg.author.id, {rolls:0,spirits:[]});
		if(gacha.rolls < 10) return msg.reply('You dont have enough rolls.');
		var gachaGuys = [];
		for(var i = 0; i < 9; i++){
			gachaGuys.push(msg.guild.members.random());
		};
		var bonusGuy = randomProperty(activeMembers);
		var returnEmbeds = [];
		for(let guy of gachaGuys){
			gacha.spirits.push(guy.user.id);
			returnEmbeds.push(new Discord.MessageEmbed({author:{name: `You got: ${guy.user.tag}!`, iconURL: guy.user.avatarURL()}}));
		};
		gacha.spirits.push(bonusGuy.id)
		returnEmbeds.push(new Discord.MessageEmbed({author:{name: `You got: ${bonusGuy.tag}!`, iconURL: bonusGuy.avatar}}));
		shuffle(returnEmbeds);
		gacha.rolls -= 10;
		msg.client.provider.set(msg.guild, "gacha"+msg.author.id, gacha);
		return msg.reply(returnEmbeds);
	}
};

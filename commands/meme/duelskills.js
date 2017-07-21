const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const oneLine = require('common-tags').oneLine;

module.exports = class DuelSkillsCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'duelskills',
			group: 'meme',
			memberName: 'duelskills',
			description: oneLine`
			A real mistake of a command.
			Allows you to set special attributes for yourself in 'rankedduel.
			Potential arguments:
			"list" to list all potential stats.
			"view" to view your current stats.
			"set" to set your stats.
			You can spend up to 10 points.
			`,
			examples: ['\'duelskills set 5 defense 2 damage 3 lifesteal'],

			args: [
				{
					key: 'ac',
					label: 'action',
					prompt: 'Enter what you would like to do.',
					type: 'string'
				},
				{
					key: 'set',
					label: 'setstats',
					prompt: 'Enter stats to set.',
					type: 'string',
					default: ''
				}
			]
		});
	}
	

	async run(msg, args) {
		switch(args.ac){
			case 'list':
				return msg.reply(
				`Damage: Adds 5% damage to every attack per point.
Evasion: Adds 1% chance to evade per point.
Defense: Reduces damage you take by 5% per point.
Lifesteal: Heal 5% of the damage you deal per point. (Ignores damage stat)
Dexterity: 1% chance to take an extra turn per point.`);
				break;
			case 'view':
				var userStats = this.client.provider.get('global', msg.author.id + 'stats', {damage: 0, evasion: 0, defense: 0, lifesteal: 0, dexterity: 0});
				return msg.reply(`Your stats are:
				Damage: ${userStats.damage}
				Evasion: ${userStats.evasion}
				Defense: ${userStats.defense}
				Lifesteal: ${userStats.lifesteal}
				Dexterity: ${userStats.dexterity}`);
				break;
			case 'set':
				var statsArgs = args.set.match(/\d+ ?(damage|evasion|defense|lifesteal|dexterity)/ig);
				var userStats = {damage: 0, evasion: 0, defense: 0, lifesteal: 0, dexterity: 0}
				if(statsArgs != null){
					var statTotal = 0;
					for(var i = 0; i < statsArgs.length; i++){
						let stat = statsArgs[i].match(/(damage|evasion|defense|lifesteal|dexterity)/i)[0].toLowerCase();
						let amount = Math.max(parseInt(statsArgs[i].match(/\d+/i)[0]), 0);
						userStats[stat] = amount;
						statTotal += amount;
					}
					if(statTotal != 10){
						return msg.reply(`Your stat total isn't 10.`);
					}
					else{
						this.client.provider.set('global', msg.author.id + 'stats', userStats);
						return msg.reply(`Set stats to:
				Damage: ${userStats.damage}
				Evasion: ${userStats.evasion}
				Defense: ${userStats.defense}
				Lifesteal: ${userStats.lifesteal}
				Dexterity: ${userStats.dexterity}
				Total: ${statTotal}`);
					}
				}
				else{
					return msg.reply(`Please enter valid stats.`);
				}
				break;
			default:
				return msg.reply('Please enter a valid argument.');
		}
	}
};

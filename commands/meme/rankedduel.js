const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const duelconfig = require('../../duel.json');

module.exports = class RankedDuelCommand extends commando.Command {
	constructor(client) {
		super(client, {
			aliases: ['rduel'],
			name: 'rankedduel',
			group: 'meme',
			memberName: 'rankedduel',
			description: 'Duels you and one other member for the leaderboard.',
			throttling:{usages:1, duration:30},
			examples: ['\'rankedduel @BorpBot#5498'],
			guildOnly: true,

			args: [
				{
					key: 'p',
					label: 'combatant',
					prompt: 'Enter who you want to fight',
					type: 'member'
				}
			]
			
		});
	}
	
	hasPermission(msg) {
		if(msg.client.isOwner(msg.author)){
			return true;
		}
		else if(msg.client.provider.get(msg.guild, 'duelBlacklistIDs', []).includes(msg.author.id)){
			return false;
		}
		else if(msg.client.provider.get(msg.guild, 'memeChannelIDs', []).includes(msg.channel.id)){
			return true
		}
		else{
			return msg.member != null && msg.member.permissions.has('MANAGE_MESSAGES')
		}
	}

	async run(msg, args) {
		if(msg.member.id === args.p.id){
			return msg.channel.send("You can't duel yourself!")
		}
		function getRandomInt(min, max){
			return Math.floor(Math.random() * (max - min + 1) + min);
		}
		var statsget1 = this.client.provider.get('global', msg.author.id + 'stats', 0);
		var statsget2 = this.client.provider.get('global', args.p.user.id + 'stats', 0);
		if(statsget1 === 0 && statsget2 === 0){
			statsget1 = {damage: 0, evasion: 0, defense: 0, lifesteal: 0, dexterity: 0};
			statsget2 = {damage: 0, evasion: 0, defense: 0, lifesteal: 0, dexterity: 0};
		}
		else{
			if(statsget1 === 0){
				var stats1total = 0;
				var inc1 = 0;
				statsget1 = {damage: 0, evasion: 0, defense: 0, lifesteal: 0, dexterity: 0};
				while(stats1total <= 10){
					inc1 >= 5 ? inc1 = 0 : inc1++;
					if(getRandomInt(0, 1) === 1){
						switch(inc1){
							case 0:
								statsget1.damage++
								break;
							case 1:
								statsget1.evasion++
								break;
							case 2:
								statsget1.defense++
								break;
							case 3:
								statsget1.lifesteal++
								break;
							case 4:
								statsget1.dexterity++
								break;
						}
						stats1total++
					}
				}
			}
			else if(statsget2 === 0){
				var stats2total = 0;
				var inc2 = 0;
				statsget2 = {damage: 0, evasion: 0, defense: 0, lifesteal: 0, dexterity: 0};
				while(stats2total <= 10){
					inc2 >= 5 ? inc2 = 0 : inc2++;
					if(getRandomInt(0, 1) === 1){
						switch(inc2){
							case 0:
								statsget2.damage++
								break;
							case 1:
								statsget2.evasion++
								break;
							case 2:
								statsget2.defense++
								break;
							case 3:
								statsget2.lifesteal++
								break;
							case 4:
								statsget2.dexterity++
								break;
						}
						stats2total++
					}
				}
			}
		}
		var turn = getRandomInt(0, 1);
		var firstTurn = turn;
		var notTurn = turn ? 0 : 1;
		var turnDescs = [];
		var duelers = [{
			name: msg.author.username,
			hp: 2000,
			stats: statsget1
		},
		{
			name: args.p.user.username,
			hp: 2000,
			stats: statsget2
		}];
		function duel(){
			let attack = duelconfig.spells[getRandomInt(0, duelconfig.spells.length - 1)];
			if(duelers[turn].stats.lifesteal > 0){
				if(attack.heal === undefined){
					attack.heal = attack.dmg*(duelers[turn].stats.lifesteal*5/100);
				}
				else{
					attack.heal += attack.dmg*(duelers[turn].stats.lifesteal*5/100);
				}
			}
			if(duelers[turn].stats.damage > 0){
				attack.dmg += attack.dmg*(duelers[turn].stats.damage*5/100)-attack.dmg*(duelers[notTurn].stats.defense*5/100);
			}
			turnDescs.push({
				name: `${duelers[turn].name}[${duelers[turn].hp/100}] uses ${attack.name} on ${duelers[notTurn].name}[${duelers[notTurn].hp/100}]`,
				value: ''
			});
			if(getRandomInt(0, 100) > duelers[notTurn].stats.evasion*1){
				if(attack.dmg != undefined){
					turnDescs[turnDescs.length-1].value += `🗡${duelers[notTurn].name}[${duelers[notTurn].hp/100}] takes ${attack.dmg/100} damage.`;
					duelers[notTurn].hp -= attack.dmg;
				}
				if(attack.heal != undefined){
					if(attack.dmg != undefined){
						turnDescs[turnDescs.length-1].value += '\n';
					}
					turnDescs[turnDescs.length-1].value += `➕${duelers[turn].name}[${duelers[turn].hp/100}] heals ${attack.heal/100} hp.`;
					duelers[turn].hp += attack.heal;
				}
			}
			else{
				turnDescs[turnDescs.length-1].value += `🗡${duelers[notTurn].name}[${duelers[notTurn].hp/100}] avoids the attack.`;
			}
			if(duelers[notTurn].hp <= 0){
				turnDescs.push({
					name: `${duelers[notTurn].name}[${duelers[notTurn].hp/100}] has been defeated, ${duelers[turn].name}[${duelers[turn].hp/100}] wins!`,
					value: duelconfig.jokes[Math.floor(Math.random() * duelconfig.jokes.length)]
				});
				let duelLeaderboard = msg.client.provider.get(msg.guild, 'duelLeaderboard', []);
				if(turn === 0){
					var winner = msg.member;
					var loser = args.p;
				}
				else{
					var winner = args.p;
					var loser = msg.member;
				}
				let entryIndexWinner = duelLeaderboard.findIndex(function(element){return element.id === winner.id});
				if(entryIndexWinner > -1){
					var winsWinner = duelLeaderboard[entryIndexWinner].score+1;
					duelLeaderboard[entryIndexWinner] = {
						score: duelLeaderboard[entryIndexWinner].score+1,
						username: winner.user.username,
						id: winner.id
					}
				}
				else{
					var winsWinner = 1;
					duelLeaderboard.push(
						{
							score: 1,
							username: winner.user.username,
							id: winner.id
						}
					);
				}
				let entryIndexLoser = duelLeaderboard.findIndex(function(element){return element.id === loser.id});
				if(entryIndexLoser > -1){
					var winsLoser = Math.max(duelLeaderboard[entryIndexLoser].score-1, 0);
					duelLeaderboard[entryIndexLoser] = {
						score: Math.max(duelLeaderboard[entryIndexLoser].score-1, 0),
						username: loser.user.username,
						id: loser.id
					}
				}
				msg.client.provider.set(msg.guild, 'duelLeaderboard', duelLeaderboard);
				return msg.channel.send({embed: {
					thumbnail: {
						url: "http://i.imgur.com/sMrWQWO.png"
					},
					author: {
						name: `Announcer ${msg.client.user.username}`,
						icon_url: msg.client.user.avatarURL
					},
					footer: {
						"icon_url": winner.user.avatarURL,
						"text": `${winner.user.username}'s wins: ${winsWinner}, ${loser.user.username}'s wins: ${winsLoser}`
					},
					color: 0x8c110b,
					title: `${msg.author.username} VS ${args.p.user.username}!`,
					description: `Coin flip decides ${duelers[firstTurn].name} will go first.`,
					fields: turnDescs
				}});
			}
			else{
				if(getRandomInt(0, 100) > duelers[turn].stats.dexterity*1){
					turn = turn ? 0 : 1;
					notTurn = turn ? 0 : 1;
					duel();
				}
				else{
					duel();
				}
			}
		}
		duel();
	}
};

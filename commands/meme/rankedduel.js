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
			description: 'Duels two members for the leaderboard.',
			throttling:{usages:1, duration:30},
			examples: ['\'duel @Guy Hero#1823 @BorpBot#5498'],
			guildOnly: true,

			args: [
				{
					key: 'p1',
					label: 'user 1',
					prompt: 'Enter combatant 1.',
					type: 'member'
				},
				{
					key: 'p2',
					label: 'user 2',
					prompt: 'Enter combatant 2',
					type: 'member'
				}
			]
			
		});
	}
	
	hasPermission(msg) {
		if(msg.client.isOwner(msg.author)){
			return true;
		}
		else if(msg.client.provider.get(msg.guild, 'memeChannelIDs', []).includes(msg.channel.id)){
			return true
		}
		else{
			return msg.member != null && msg.member.permissions.has('MANAGE_MESSAGES')
		}
	}

	async run(msg, args) {
		if(args.p1.id === args.p2.id){
			return msg.channel.send("You can't duel yourself!")
		}
		function getRandomInt(min, max){
			return Math.floor(Math.random() * (max - min + 1) + min);
		}
		var turn = getRandomInt(0, 1);
		var firstTurn = turn;
		var notTurn = turn ? 0 : 1;
		var turnDescs = [];
		var duelers = [{
			name: args.p1.user.username,
			hp: 20
		},
		{
			name: args.p2.user.username,
			hp: 20
		}];
		function duel(){
			if(getRandomInt(0, 1000) === 1000){
				turnDescs.push({
					name: `${duelers[turn].name}[${duelers[turn].hp}] uses Fedora Tip on ${duelers[notTurn].name}[${duelers[notTurn].hp}]`,
					value: "The damage is off the charts!"
				});
				duelers[notTurn].hp -= 9999;
			}
			else{
				let attack = duelconfig.spells[getRandomInt(0, duelconfig.spells.length - 1)];
				turnDescs.push({
					name: `${duelers[turn].name}[${duelers[turn].hp}] uses ${attack.name} on ${duelers[notTurn].name}[${duelers[notTurn].hp}]`,
					value: ''
				});
				if(attack.dmg != undefined){
					turnDescs[turnDescs.length-1].value += `🗡${duelers[notTurn].name}[${duelers[notTurn].hp}] takes ${attack.dmg} damage.`;
					duelers[notTurn].hp -= attack.dmg;
				}
				if(attack.heal != undefined){
					if(attack.dmg != undefined){
						turnDescs[turnDescs.length-1].value += '\n';
					}
					turnDescs[turnDescs.length-1].value += `➕${duelers[turn].name}[${duelers[turn].hp}] heals ${attack.heal} hp.`;
					duelers[turn].hp += attack.heal;
				}
			}
			if(duelers[notTurn].hp <= 0){
				turnDescs.push({
					name: `${duelers[notTurn].name}[${duelers[notTurn].hp}] has been defeated, ${duelers[turn].name}[${duelers[turn].hp}] wins!`,
					value: duelconfig.jokes[Math.floor(Math.random() * duelconfig.jokes.length)]
				});
				let duelLeaderboard = msg.client.provider.get(msg.guild, 'duelLeaderboard', []);
				let entryIndex = duelLeaderboard.findIndex(function(element){return element.id === args["p"+(turn+1)].user.id});
				if(entryIndex > -1){
					var wins = duelLeaderboard[entryIndex].score+1;
					duelLeaderboard[entryIndex] = {
						score: duelLeaderboard[entryIndex].score+1,
						username: args["p"+(turn+1)].user.username,
						id: args["p"+(turn+1)].id
					}
				}
				else{
					var wins = 1;
					duelLeaderboard.push(
						{
							score: 1,
							username: args["p"+(turn+1)].user.username,
							id: args["p"+(turn+1)].id
						}
					);
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
					"footer": {
						"icon_url": args["p"+(turn+1)].user.avatarURL,
						"text": `${args["p"+(turn+1)].user.username}'s wins: ${wins}`
					},
					color: 0x8c110b,
					title: `${args.p1.user.username} VS ${args.p2.user.username}!`,
					description: `Coin flip decides ${duelers[firstTurn].name} will go first.`,
					fields: turnDescs
				}});
			}
			else{
				turn = turn ? 0 : 1;
				notTurn = turn ? 0 : 1;
				duel();
			}
		}
		duel();
	}
};

const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const spells = require('../../spells.json');

module.exports = class RankedDuelCommand extends commando.Command {
	constructor(client) {
		super(client, {
			aliases: ['rduel'],
			name: 'rankedduel',
			group: 'meme',
			memberName: 'rankedduel',
			description: 'Duels two members.',
			throttling:{usages:1, duration:30},
			examples: ['\'duel @Guy Hero#1823 @BorpBot#5498'],

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
		if(args.p1.id === args.p2.id){
			return msg.channel.send("You can't duel yourself!")
		}
		function getRandomInt(min, max){
			return Math.floor(Math.random() * (max - min + 1) + min);
		}
		var turn = getRandomInt(0, 1);
		var notTurn = turn ? 0 : 1;
		var duelString = "";
		var duelers = [{
			name: args.p1,
			hp: 20
		},
		{
			name: args.p2,
			hp: 20
		}];
		duelString += `Coin flip decides that ${duelers[turn].name} will go first.\n`
		function duel(){
			if(getRandomInt(0, 1000) === 1000){
				duelString += `${duelers[turn].name}[${duelers[turn].hp}] uses Fedora Tip on ${duelers[notTurn].name}[${duelers[notTurn].hp}], deals euphoric damage.`
				duelers[notTurn].hp -= 9999;
			}
			else{
				let attack = spells[getRandomInt(0, spells.length - 1)];
				duelString += `${duelers[turn].name}[${duelers[turn].hp}] uses ${attack.name}`
				if(attack.dmg != undefined){
					duelString += ` on ${duelers[notTurn].name}[${duelers[notTurn].hp}], deals ${attack.dmg} damage`;
					duelers[notTurn].hp -= attack.dmg;
				}
				if(attack.heal != undefined){
					duelString += `, heals ${attack.heal} hp`;
					duelers[turn].hp += attack.heal;
				}
			}
			duelString += ".\n"
			if(duelers[notTurn].hp <= 0){
				duelString += `${duelers[notTurn].name}[${duelers[notTurn].hp}] has been defeated, ${duelers[turn].name}[${duelers[turn].hp}] wins.`
				let duelLeaderboard = msg.client.provider.get(msg.guild, 'duelLeaderboard', []);
				let entryIndex = duelLeaderboard.findIndex(function(element){return element.id === args["p"+(turn+1)].user.id});
				if(entryIndex > -1){
					duelLeaderboard[entryIndex] = {
						score: duelLeaderboard[entryIndex].score+1,
						username: args["p"+(turn+1)].user.username,
						id: args["p"+(turn+1)].id
					}
				}
				else{
					duelLeaderboard.push(
						{
							score: 1,
							username: args["p"+(turn+1)].user.username,
							id: args["p"+(turn+1)].id
						}
					);
				}
				msg.client.provider.set(msg.guild, 'duelLeaderboard', duelLeaderboard);
				if(duelString.length < 1999){
					return msg.channel.send(duelString);
				}
				else{
					let messageBuffer = new Buffer(duelString, 'utf-8')
					return msg.channel.send({files: [{attachment: messageBuffer,name: `result.txt`}]})
				}
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

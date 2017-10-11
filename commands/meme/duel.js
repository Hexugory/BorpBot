const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const duelconfig = require('../../duel.json');

module.exports = class DuelCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'duel',
			group: 'meme',
			memberName: 'duel',
			description: 'Duels two inputs.',
			throttling:{usages:1, duration:30},
			examples: ['\'duel @Guy Hero#1823 @BorpBot#5498'],

			args: [
				{
					key: 'p1',
					label: 'fighter 1',
					prompt: 'Enter combatant 1.',
					type: 'string'
				},
				{
					key: 'p2',
					label: 'fighter 2',
					prompt: 'Enter combatant 2',
					type: 'string'
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
		function getRandomInt(min, max){
			return Math.floor(Math.random() * (max - min + 1) + min);
		}
		var turn = getRandomInt(0, 1);
		var firstTurn = turn;
		var notTurn = turn ? 0 : 1;
		var turnDescs = [];
		var duelers = [{
			name: args.p1,
			hp: 20
		},
		{
			name: args.p2,
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
					//possbile random text there later
				});
				return msg.channel.send({embed: {
					thumbnail: {
						url: "http://i.imgur.com/sMrWQWO.png"
					},
					author: {
						name: `Announcer ${msg.client.user.username}`,
						icon_url: msg.client.user.avatarURL
					},
					color: 0x8c110b,
					title: `${args.p1} VS ${args.p2}!`,
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

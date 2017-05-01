const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const spells = require('../../spells.json');
const mMessages = require('../../perms.js').mMessages;

module.exports = class DuelCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'duel',
			group: 'meme',
			memberName: 'duel',
			description: 'Duels two users.',
			throttling:{usages:1, duration:30},
			examples: ['\'duel @Guy Hero#1823 @BorpBot#5498'],

			args: [
				{
					key: 'p1',
					label: 'user1',
					prompt: 'Enter combatant 1.',
					type: 'string',
					default: 'blank'
				},
				{
					key: 'p2',
					label: 'user2',
					prompt: 'Enter combatant 2',
					type: 'string',
					default: 'blank'
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
			return msg.member != null && msg.member.hasPermission(mMessages)
		}
	}

	async run(msg, args) {
		var duelsend = "";
		var hp = [20, 20];
		var attacker = Math.round(Math.random());
		var attacked = 1;
		var users = [args.p1, args.p2];
		function duel(){
			if(attacker === 0){
				attacked = 1;
			}
			else{
				attacked = 0;
			}
			if(Math.floor(Math.random()*1000) === 1){
				duelsend += `${users[attacker]}[${hp[attacker]}] uses Fedora Tip on ${users[attacked]}[${hp[attacked]}], deals euphoric damage.`
				hp[attacked] -= 9999;
			}
			else{
				let attack = spells[Math.floor(Math.random() * spells.length)];
				duelsend += `${users[attacker]}[${hp[attacker]}] uses ${attack.name}`
				if(attack.dmg != undefined){
					duelsend += ` on ${users[attacked]}[${hp[attacked]}], deals ${attack.dmg} damage`;
					hp[attacked] -= attack.dmg;
				}
				if(attack.heal != undefined){
					duelsend += `, heals ${attack.heal} hp`;
					hp[attacker] += attack.heal;
				}
			}
			duelsend += ".\r"
			if(hp[attacked] <= 0){
				duelsend += `${users[attacked]}[${hp[attacked]}] has been defeated, ${users[attacker]}[${hp[attacker]}] wins.`
				if(duelsend.length < 1999){
					return msg.channel.send(`${duelsend}`);
				}
				else{
					return msg.reply("The duel was too long, cant send.")
				}
			}
			else{
				if(attacker === 0){
					attacker = 1;
				}
				else{
					attacker = 0;
				}
				duel();
			}
		}
		duel();
	}
};

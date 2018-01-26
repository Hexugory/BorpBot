const commando = require('discord.js-commando');
const sqlite = require('sqlite');
var duelconfig = require('../../duel.json');
for(var i = 0; i < duelconfig.itemmovesets.length; i++){
	duelconfig.types.push({
		name: duelconfig.itemmovesets[i].name,
		max: 1,
		min: 1,
		ordinary: false,
		epic: true,
		legendary: false,
		moveset: true,
		template: `Change your attacks to attacks from ${duelconfig.itemmovesets[i].name}.`
	})
}
const moment = require('moment');

module.exports = class RankedDuelCommand extends commando.Command {
	constructor(client) {
		super(client, {
			aliases: ['rduel'],
			name: 'rankedduel',
			group: 'meme',
			memberName: 'rankedduel',
			description: 'Duels yourself and another member for the leaderboard. Can only use if you have three duel items equipped. You gain duel items at random whenever you send a message.',
			throttling:{usages:1, duration:5},
			examples: ['\'rankedduel @BorpBot#5498'],
			guildOnly: true,

			args: [
				{
					key: 'p2',
					label: 'member',
					prompt: 'Choose who you want to fight.',
					type: 'member'
				}
			]
			
		});
	}
	
	hasPermission(msg) {
		return msg.client.isOwner(msg.author) || (msg.guild && (msg.member.permissions.has('MANAGE_MESSAGES') || msg.client.provider.get(msg.guild, 'memeChannelIDs', []).includes(msg.channel.id)))
	}

	async run(msg, args) {
		if(msg.author.id === args.p2.id){
			return msg.channel.send("You can't duel yourself!")
		}
		function getRandomInt(min, max){
			return Math.floor(Math.random() * (max - min + 1) + min);
		}
		var turn = getRandomInt(0, 1);
		var firstTurn = turn;
		var notTurn = turn ? 0 : 1;
		var turnDescs = [];
		var duelstats = msg.client.provider.get(msg.guild, "duelstats", {})
		if((!duelstats[msg.author.id] || duelstats[msg.author.id].equipped.includes(null)) || (!duelstats[args.p2.user.id] || duelstats[args.p2.user.id].equipped.includes(null))){
			return msg.reply("One (or more) of you cannot use 'rankedduel.\nYou cannot use 'rankedduel if you do not have 3 items equipped.");
		}
		var duelers = [{
			name: msg.author.username,
			hp: 200,
			id: msg.author.id,
			avatar: msg.author.avatarURL,
			equipped: duelstats[msg.author.id].equipped,
			moveset: duelstats[msg.author.id].moveset ? duelstats[msg.author.id].moveset : null,
			heal: 0,
			dmg: 0,
			fdmg: 0
		},
		{
			name: args.p2.user.username,
			hp: 200,
			id: args.p2.user.id,
			avatar: args.p2.user.avatarURL,
			equipped: duelstats[args.p2.user.id].equipped,
			moveset: duelstats[args.p2.user.id].moveset ? duelstats[msg.author.id].moveset : null,
			heal: 0,
			dmg: 0,
			fdmg: 0
		}];
		var extraTurnNum = 0;
		let duelCooldown = msg.client.provider.get(msg.guild, "duelCooldown", []);
		function checkCooldown(){
			for(var i = 0; i < duelCooldown.length+1; i++){
				if(duelCooldown[i] === undefined){
					return true;
				}
				else if(duelCooldown[i].id === msg.author.id && moment.utc().isAfter(duelCooldown[i].time)){
					return true;
				}
				else if(duelCooldown[i].id === msg.author.id && moment.utc().isBefore(duelCooldown[i].time)){
					msg.reply(`You lost a duel you initiated, so you cannot use this command again until ${moment.utc(duelCooldown[i].time).format('MMMM Do YYYY, h:mm:ss a ZZ')}, \`${Math.round((parseInt(moment.utc(duelCooldown[i].time).format('x'))-parseInt(moment.utc().format('x')))/1000/60)}\` minutes from now.`);
					return false;
				}
			}
		}
		function searchArrayForID(element){
			return element.id === msg.author.id;
		}
		//time to contract cancer
		var sortOrder = {
			flatdamage: 0,
			doubledamage: 1,
			damage: 2,
			defense: 3,
			halfdamage: 4,
			drain: 5,
			flatdamageafter: 6,
			flatdamageheal: 7
		}
		function applyItemAttackModifiers(){
			let effectsToApply = [];
			for(var i = 0; i < 3; i++){
				for(var o = 0; o < 2; o++){
					duelers[o].equipped[i].turn = turn === o ? turn : notTurn;
					effectsToApply.push(duelers[o].equipped[i]);
				}
			}
			effectsToApply = effectsToApply.sort(function(a,b){
				return sortOrder[a.type] - sortOrder[b.type]
			})
			for(var i = 0; i < effectsToApply.length; i++){
				if(effectsToApply[i].type === "damage" && effectsToApply[i].turn === turn){
					duelers[notTurn].dmg *= ((effectsToApply[i].mag/100)+1);
				}
				else if(effectsToApply[i].type === "drain" && effectsToApply[i].turn === turn){
					duelers[turn].heal += (duelers[notTurn].dmg*(effectsToApply[i].mag/100));
				}
				else if(effectsToApply[i].type === "defense" && effectsToApply[i].turn === notTurn){
					duelers[notTurn].dmg *= (1-(effectsToApply[i].mag/100));
				}
				else if(effectsToApply[i].type === "doubledamage" && effectsToApply[i].turn === turn){
					if(getRandomInt(1, 100) <= effectsToApply[i].mag){
						duelers[notTurn].dmg *= 2;
					}
				}
				else if(effectsToApply[i].type === "halfdamage" && effectsToApply[i].turn === notTurn){
					if(getRandomInt(1, 100) <= effectsToApply[i].mag){
						duelers[notTurn].dmg /= 2;
					}
				}
				else if(effectsToApply[i].type === "flatdamageafter" && effectsToApply[i].turn === turn){
					duelers[notTurn].fdmg += effectsToApply[i].mag;
				}
				else if(effectsToApply[i].type === "flatdamage" && effectsToApply[i].turn === turn){
					duelers[notTurn].dmg += effectsToApply[i].mag;
				}
				else if(effectsToApply[i].type === "flatdamageheal"){
					duelers[effectsToApply[i].turn ? 0 : 1].fdmg += (duelers[effectsToApply[i].turn].heal*(effectsToApply[i].mag/100));
				}
			}
		}
		let healthup0 = duelers[0].equipped.filter(function(element){return element.type.includes('healthup')});
		if(Array.isArray(healthup0)){
			for(var i = 0; i < healthup0.length; i++){
				duelers[0].hp *= ((healthup0[i].mag/100)+1);
			}
		}
		let healthup1 = duelers[1].equipped.filter(function(element){return element.type.includes('healthup')});
		if(Array.isArray(healthup1)){
			for(var i = 0; i < healthup1.length; i++){
				duelers[1].hp *= ((healthup1[i].mag/100)+1);
			}
		}
		duelers[0].hp = Math.round(duelers[0].hp);
		duelers[1].hp = Math.round(duelers[1].hp);
		function duel(){
			duelers[notTurn].dmg = 0;
			duelers[turn].dmg = 0;
			duelers[turn].heal = 0;
			duelers[notTurn].heal = 0;
			duelers[turn].fdmg = 0;
			duelers[notTurn].fdmg = 0;
			if(duelers[turn].moveset){
				let moveset = duelconfig.itemmovesets.find(function(element){return element.name === duelers[turn].moveset.type})
				var attack = moveset.moves[getRandomInt(0, moveset.moves.length - 1)];
			}
			else{
				var attack = duelconfig.spells[getRandomInt(0, duelconfig.spells.length - 1)];
			}
			let tipitems = duelers[turn].equipped.filter(function(element){return element.type.includes('fedoratip')});
			if(Array.isArray(tipitems)){
				for(var i = 0; i < tipitems.length; i++){
					if(getRandomInt(1, 1000) === 69){
						attack = {name: "Fedora Tip", dmg: 99999};
					}
				}
			}
			duelers[notTurn].dmg = attack.dmg ? attack.dmg : 0;
			let selfswapitem = duelers[turn].equipped.find(function(element){return element.type.includes('selfswap')});
			if(selfswapitem){
				duelers[notTurn].dmg += attack.selfdmg ? attack.selfdmg : 0;
			}
			else{
				duelers[turn].dmg += attack.selfdmg ? attack.selfdmg : 0;
			}
			let healitem = duelers[notTurn].equipped.find(function(element){return element.type.includes('healsteal')});
			if(attack.heal){
				if(healitem && healitem.quality != 'Legendary'){
					duelers[notTurn].heal = attack.heal;
				}
				else{
					duelers[turn].heal = attack.heal;
				}
			}
			applyItemAttackModifiers();
			if(healitem && healitem.quality === 'Legendary'){
				duelers[notTurn].heal += duelers[turn].heal;
				duelers[turn].heal = 0;
			}
			duelers[notTurn].dmg = Math.round(duelers[notTurn].dmg);
			duelers[turn].dmg = Math.round(duelers[turn].dmg);
			duelers[turn].heal = Math.round(duelers[turn].heal);
			duelers[notTurn].heal = Math.round(duelers[notTurn].heal);
			duelers[notTurn].fdmg = Math.round(duelers[notTurn].fdmg);
			duelers[turn].fdmg = Math.round(duelers[turn].fdmg);
			duelers[notTurn].dmg += duelers[notTurn].fdmg;
			duelers[turn].dmg += duelers[turn].fdmg;
			turnDescs.push({
				name: `${duelers[turn].name}[${duelers[turn].hp}] uses ${attack.name} on ${duelers[notTurn].name}[${duelers[notTurn].hp}]`,
				value: ''
			});
			if(duelers[notTurn].dmg){
				turnDescs[turnDescs.length-1].value += `🗡${duelers[notTurn].name}[${duelers[notTurn].hp}] takes ${duelers[notTurn].dmg} damage.\n`
			}
			if(duelers[turn].dmg){
				turnDescs[turnDescs.length-1].value += `🗡${duelers[turn].name}[${duelers[turn].hp}] takes ${duelers[turn].dmg} damage.\n`
			}
			if(duelers[notTurn].heal){
				turnDescs[turnDescs.length-1].value += `➕${duelers[notTurn].name}[${duelers[notTurn].hp}] heals ${duelers[notTurn].heal} damage.\n`
			}
			if(duelers[turn].heal){
				turnDescs[turnDescs.length-1].value += `➕${duelers[turn].name}[${duelers[turn].hp}] heals ${duelers[turn].heal} damage.\n`
			}
			duelers[notTurn].hp -= duelers[notTurn].dmg;
			duelers[turn].hp -= duelers[turn].dmg;
			duelers[turn].hp += duelers[turn].heal;
			duelers[notTurn].hp += duelers[notTurn].heal;
			if(duelers[notTurn].hp <= 0){
				turnDescs.push({
					name: `${duelers[notTurn].name}[${duelers[notTurn].hp}] has been defeated, ${duelers[turn].name}[${duelers[turn].hp}] wins!`,
					value: duelconfig.jokes[Math.floor(Math.random() * duelconfig.jokes.length)]
				});
				if(notTurn === 0){
					let skipCooldownArray = duelers[notTurn].equipped.filter(function(element){return element.type === 'skipcooldown'});
					var skipCooldownBool = false;
					if(skipCooldownArray[0]){
						for(var i = 0; i < skipCooldownArray.length; i++){
							if(!skipCooldownBool && getRandomInt(1, 100) <= skipCooldownArray[i].mag){
								skipCooldownBool = true;
								turnDescs[turnDescs.length-1].value += `❤${duelers[notTurn].name}[${duelers[notTurn].hp}] is still ready to fight again.`
							}
						}
					}
					if(!skipCooldownBool){
						let IDIndex = duelCooldown.findIndex(searchArrayForID);
						if(IDIndex>-1){
							duelCooldown[IDIndex].time = moment.utc().add(30, "minute");
							msg.client.provider.set(msg.guild, "duelCooldown", duelCooldown);
						}
						else{
							duelCooldown.push({time: moment.utc().add(30, "minute"), id: msg.author.id});
							msg.client.provider.set(msg.guild, "duelCooldown", duelCooldown);
						}
					}
				}
				let winsLeaderboard = msg.client.provider.get(msg.guild, 'winsLeaderboard', []);
				let entryIndex = winsLeaderboard.findIndex(function(element){return element.id === duelers[turn].id});
				if(entryIndex > -1){
					var wins = winsLeaderboard[entryIndex].score+1;
					winsLeaderboard[entryIndex] = {
						score: winsLeaderboard[entryIndex].score+1,
						username: duelers[turn].name,
						id: duelers[turn].id
					}
				}
				else{
					var wins = 1;
					winsLeaderboard.push(
						{
							score: 1,
							username: duelers[turn].name,
							id: duelers[turn].id
						}
					);
				}
				msg.client.provider.set(msg.guild, 'winsLeaderboard', winsLeaderboard);
				let rankLeaderboard = msg.client.provider.get(msg.guild, 'rankLeaderboard', []);
				let winnerIndex = rankLeaderboard.findIndex(function(element){return element.id === duelers[turn].id});
				let loserIndex = rankLeaderboard.findIndex(function(element){return element.id === duelers[notTurn].id});
				if(winnerIndex > -1){
					rankLeaderboard[winnerIndex] = {
						score: rankLeaderboard[winnerIndex].score,
						username: duelers[turn].name,
						id: duelers[turn].id
					}
				}
				else{
					rankLeaderboard.push(
						{
							score: 1000,
							username: duelers[turn].name,
							id: duelers[turn].id
						}
					);
					winnerIndex = rankLeaderboard.length-1;
				}
				if(loserIndex > -1){
					rankLeaderboard[loserIndex] = {
						score: rankLeaderboard[loserIndex].score,
						username: duelers[notTurn].name,
						id: duelers[notTurn].id
					}
				}
				else{
					rankLeaderboard.push(
						{
							score: 1000,
							username: duelers[notTurn].name,
							id: duelers[notTurn].id
						}
					);
					loserIndex = rankLeaderboard.length-1;
				}
				var rankDiff = rankLeaderboard[loserIndex].score-rankLeaderboard[winnerIndex].score;
				var rankGained = Math.round(Math.min(Math.pow(1.0018, rankDiff)*100, 500));
				if(rankGained > rankLeaderboard[loserIndex].score){
					rankGained = rankLeaderboard[loserIndex].score;
				}
				rankLeaderboard[winnerIndex].score += rankGained;
				rankLeaderboard[loserIndex].score -= rankGained;
				var rank = rankLeaderboard[winnerIndex].score;
				msg.client.provider.set(msg.guild, 'rankLeaderboard', rankLeaderboard);
				return msg.channel.send({embed: {
					thumbnail: {
						url: "http://i.imgur.com/sMrWQWO.png"
					},
					author: {
						name: `Announcer ${msg.client.user.username}`,
						icon_url: msg.client.user.avatarURL
					},
					"footer": {
						"icon_url": duelers[turn].avatar,
						"text": `${duelers[turn].name}'s wins/rank: ${wins}/${rank}`
					},
					color: 0x8c110b,
					title: `${msg.author.username} VS ${args.p2.user.username}!`,
					description: `Coin flip decides ${duelers[firstTurn].name} will go first.`,
					fields: turnDescs
				}});
			}
			else if(duelers[notTurn].hp !== duelers[notTurn].hp || duelers[turn].hp !== duelers[turn].hp){
				return msg.reply("fuck\nif you see this then you need to ping guy hero right now")
			}
			else{
				let extraTurnArray = duelers[turn].equipped.filter(function(element){return element.type === 'extraturn'});
				let addedTurns = 0;
				if(extraTurnArray[0]){
					for(var i = 0; i < extraTurnArray.length; i++){
						if(getRandomInt(1, 100) <= extraTurnArray[i].mag){
							extraTurnNum++;
							addedTurns++;
						}
					}
				}
				if(extraTurnNum > 0){
					addedTurns > 0 ? turnDescs[turnDescs.length-1].value += `💨${duelers[turn].name}[${duelers[turn].hp}] takes ${addedTurns > 1 ? `${addedTurns} extra turns` : 'an extra turn'}.` : null;
					extraTurnNum--;
					duel();
				}
				else{
					turn = turn ? 0 : 1;
					notTurn = turn ? 0 : 1;
					duel();
				}
			}
		}
		if(checkCooldown()){
			duel();
		}
	}
};

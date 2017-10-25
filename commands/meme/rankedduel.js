const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const duelconfig = require('../../duel.json');
const moment = require('moment');

module.exports = class RankedDuelCommand extends commando.Command {
	constructor(client) {
		super(client, {
			aliases: ['rduel'],
			name: 'rankedduel',
			group: 'meme',
			memberName: 'rankedduel',
			description: 'Duels yourself and another member for the leaderboard. Can only use if you have three duel items equipped. You gain duel items at random whenever you send a message.',
			throttling:{usages:1, duration:30},
			examples: ['\'duel @BorpBot#5498'],
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
		var duelers = [{
			name: msg.author.username,
			hp: 200,
			id: msg.author.id,
			avatar: msg.author.avatarURL,
			equipped: msg.client.provider.get(msg.guild, "duelstats" + msg.author.id, {items: [], equipped: [null, null, null]}).equipped,
			heal: 0,
			dmg: 0,
			fdmg: 0
		},
		{
			name: args.p2.user.username,
			hp: 200,
			id: args.p2.user.id,
			avatar: args.p2.user.avatarURL,
			equipped: msg.client.provider.get(msg.guild, "duelstats" + args.p2.user.id, {items: [], equipped: [null, null, null]}).equipped,
			heal: 0,
			dmg: 0,
			fdmg: 0
		}];
		if(duelers[0].equipped.includes(null) || duelers[1].equipped.includes(null)){
			return msg.reply("One (or more) of you cannot use 'rankedduel.\nYou cannot use 'rankedduel if you do not have 3 items equipped.");
		}
		else{
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
			function applyItemAttackModifier(slot, dueler){
				if(duelers[dueler].equipped[slot].type === "damage" && dueler === turn){
					duelers[notTurn].dmg *= ((duelers[dueler].equipped[slot].mag/100)+1);
				}
				else if(duelers[dueler].equipped[slot].type === "drain" && dueler === turn){
					duelers[turn].heal += (duelers[notTurn].dmg*(duelers[dueler].equipped[slot].mag/100));
				}
				else if(duelers[dueler].equipped[slot].type === "defense" && dueler === notTurn){
					duelers[notTurn].dmg *= (1-(duelers[dueler].equipped[slot].mag/100));
				}
				else if(duelers[dueler].equipped[slot].type === "doubledamage" && dueler === turn){
					if(getRandomInt(1, 100) <= duelers[dueler].equipped[slot].mag){
						duelers[notTurn].dmg *= 2;
					}
				}
				else if(duelers[dueler].equipped[slot].type === "halfdamage" && dueler === notTurn){
					if(getRandomInt(1, 100) <= duelers[dueler].equipped[slot].mag){
						duelers[notTurn].dmg /= 2;
					}
				}
				else if(duelers[dueler].equipped[slot].type === "flatdamageafter" && dueler === turn){
					duelers[notTurn].fdmg += duelers[dueler].equipped[slot].mag;
				}
				else if(duelers[dueler].equipped[slot].type === "flatdamage" && dueler === turn){
					duelers[notTurn].dmg += duelers[dueler].equipped[slot].mag;
				}
			}
			function duel(){
				duelers[notTurn].dmg = 0;
				duelers[turn].dmg = 0;
				duelers[turn].heal = 0;
				duelers[notTurn].heal = 0;
				duelers[turn].fdmg = 0;
				duelers[notTurn].fdmg = 0;
				let attack = duelconfig.spells[getRandomInt(0, duelconfig.spells.length - 1)];
				let tipitems = duelers[turn].equipped.filter(function(element){return element.type.includes('fedoratip')});
				if(Array.isArray(tipitems)){
					for(var i = 0; i < tipitems.length; i++){
						if(getRandomInt(1, 1000) === 69){
							attack = {name: "Fedora Tip", dmg: 99999};
						}
					}
				}
				duelers[notTurn].dmg = attack.dmg;
				let healitem = duelers[notTurn].equipped.find(function(element){return element.type.includes('healsteal')});
				if(attack.heal){
					if(healitem && healitem.quality != 'Legendary'){
						duelers[notTurn].heal = attack.heal;
					}
					else{
						duelers[turn].heal = attack.heal;
					}
				}
				for(var i = 0; i <= 2; i++){
					for(var o = 0; o <= 1; o++){
						applyItemAttackModifier(i, o);
					}
				}
				if(healitem && healitem.quality === 'Legendary'){
					duelers[notTurn].heal += duelers[turn].heal;
					duelers[turn].heal = 0;
				}
				duelers[notTurn].dmg = Math.ceil(duelers[notTurn].dmg);
				duelers[turn].dmg = Math.ceil(duelers[turn].dmg);
				duelers[turn].heal = Math.round(duelers[turn].heal);
				duelers[notTurn].heal = Math.round(duelers[notTurn].heal);
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
								if(getRandomInt(1, 100) <= skipCooldownArray[i].mag){
									skipCooldownBool = true;
									turnDescs[turnDescs.length-1].value += `❤${duelers[notTurn].name}[${duelers[notTurn].hp}] is still ready to fight again.`
								}
							}
						}
						if(!skipCooldownBool){
							let IDIndex = duelCooldown.findIndex(searchArrayForID);
							if(IDIndex>-1){
								duelCooldown[IDIndex].time = moment.utc().add(1, "hour");
								msg.client.provider.set(msg.guild, "duelCooldown", duelCooldown);
							}
							else{
								duelCooldown.push({time: moment.utc().add(1, "hour"), id: msg.author.id});
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
					var extraTurnBool = false;
					if(extraTurnArray[0]){
						for(var i = 0; i < extraTurnArray.length; i++){
							if(getRandomInt(1, 100) <= extraTurnArray[i].mag){
								extraTurnBool = true;
								turnDescs[turnDescs.length-1].value += `💨${duelers[turn].name}[${duelers[turn].hp}] takes an extra turn.`
							}
						}
					}
					if(extraTurnBool){
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
	}
};

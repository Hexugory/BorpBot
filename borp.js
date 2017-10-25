const commando = require('discord.js-commando');
const path = require('path');
const oneLine = require('common-tags').oneLine;
const sqlite = require('sqlite');
const config = require('./config.json');
const prompt = require('prompt');
const emojiRegex = require('emoji-regex');
const moment = require('moment');

const client = new commando.Client({
	owner: config.owner,
	commandPrefix: config.prefix,
	unknownCommandResponse: false,
	invite: 'http://discord.gg/hAj5dY8'
});

var types = [
	{name: "damage", max: 30, min: 5, ordinary: true, epic: true, legendary: true, template: "Increase damage dealt by {mag}%."},
	{name: "drain", max: 15, min: 5, ordinary: true, epic: true, legendary: true, template: "Heal yourself for {mag}% of all damage you deal."},
	{name: "defense", max: 15, min: 5, ordinary: true, epic: true, legendary: true, template: "Decrease damage taken by {mag}%."},
	{name: "extraturn", max: 10, min: 1, ordinary: true, epic: true, legendary: true, template: "{mag}% chance to take an extra turn."},
	{name: "healsteal", max: 1, min: 1, ordinary: true, epic: false, legendary: false, template: "Steal all healing done by the enemy (before modifiers)."},
	{name: "healsteallegendary", max: 1, min: 1, ordinary: false, epic: false, legendary: true, template: "Steal all healing done by the enemy (after modifiers)."},
	{name: "doubledamage", max: 30, min: 5, ordinary: true, epic: false, legendary: false, template: "{mag}% chance to double damage dealt."},
	{name: "halfdamage", max: 20, min: 5, ordinary: true, epic: false, legendary: false, template: "{mag}% chance to halve damage taken."},
	{name: "skipcooldown", max: 5, min: 5, ordinary: false, epic: false, legendary: true, template: "{mag}% chance to skip your fight cooldown when you lose."},
	{name: "fedoratip", max: 1, min: 1, ordinary: false, epic: true, legendary: false, template: "0.1% chance to use Fedora Tip."},
	{name: "flatdamageafter", max: 20, min: 1, ordinary: true, epic: true, legendary: true, template: "Add {mag} damage to all of your attacks (after modifiers)."},
	{name: "flatdamage", max: 20, min: 1, ordinary: true, epic: true, legendary: true, template: "Add {mag} damage to all of your attacks."}
]

function sendMessages(arr, content){
	for(var i = 0; i < arr.length; i++){
		try{
			client.channels.get(arr[i]).send(content)
		}
		catch(err){console.log(err)}
	}
}

function getRandomInt(min, max){
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function generateNewItem(){
	let item = {};
	item.quality = getRandomInt(0, 100) > 90 ? (getRandomInt(0, 100) > 90 ? "Legendary" : "Epic") : "Ordinary";
	let filteredtypes = types.filter(function(element){return element[item.quality.toLowerCase()]})
	let type = filteredtypes[getRandomInt(0,filteredtypes.length-1)];
	item.type = type.name;
	item.template = type.template;
	item.mag = item.quality === "Legendary" ? getRandomInt(type.max*2+1,type.max*3) : (item.quality === "Epic" ? getRandomInt(type.max+1,type.max*2) : getRandomInt(type.min,type.max));
	return item;
}

function createStringFromTemplate(template, variables) {
	return template.replace(new RegExp("\{([^\{]+)\}", "g"), function(_unused, varName){
		return variables[varName];
	});
}

function createDescString(item){
	if(!item){
		return "None";
	}
	else{
		return `${item.quality} quality: ${createStringFromTemplate(item.template, {mag: item.mag})}`;
	}
}

client.dispatcher.addInhibitor((msg) => {
	let gblacklist = client.provider.get('global', 'blacklist', []);
	let blacklist = client.provider.get(msg.guild, 'blacklist', {});
	if(msg.command){
		if(((blacklist[msg.command.group.id] != undefined && blacklist[msg.command.group.id].includes(msg.author.id)) || (blacklist[msg.command.name] != undefined && blacklist[msg.command.name].includes(msg.author.id)) || (blacklist.server != undefined && blacklist.server.includes(msg.author.id)) || gblacklist.includes(msg.author.id)) && !msg.client.isOwner(msg.author)){
			return true;
		}
		else{
			return false;
		}
	}
});

client
	.on('error', console.error)
	.on('warn', console.warn)
	.on('debug', console.log)
	.on('ready', () => {
		console.log(`Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
		client.user.setGame(config.game)
		setInterval(function(){
			try{
				var times = client.provider.get('global', 'times', []);
				for(var i = 0; i < times.length; i++){
					if(moment.utc().isAfter(times[i].time)){
						let recipient = client.users.get(times[i].user);
						if(recipient != undefined){
							client.users.get(times[i].user).send(`You asked to be reminded at ${moment.utc(times[i].time).format('MMMM Do YYYY, h:mm:ss a ZZ')} of:  ${times[i].message}`)
						}
						times.splice(i, 1)
					}
				}
				client.provider.set('global', 'times', times);
			}
			catch(err){console.log(err)}
		}, 60000)
	})
	.on('disconnect', () => { console.warn('Disconnected!'); })
	.on('reconnecting', () => { console.warn('Reconnecting...'); })
	.on('message', (msg) => {
		let xChannelIDs = client.provider.get(msg.guild, 'xChannelIDs', null);
		if(xChannelIDs != null){
			if(xChannelIDs.includes(msg.channel.id)){
				let xLimit = client.provider.get(msg.guild, 'xLimit' + msg.channel.id, 7)
				let emoji = [];
				let unicodeEmoji = msg.content.match(emojiRegex());
				let customEmoji = msg.content.match(/<:\w\w*:\d\d*>/ig);
				if(unicodeEmoji){
					emoji = emoji.concat(unicodeEmoji)
				}
				if(customEmoji){
					emoji = emoji.concat(customEmoji)
				}
				if(emoji.length >= 4){
					xLimit > 1 ? msg.react('\u{274c}') : msg.delete();
				}
				else{
					let checkcount = 0
					let checkx = setInterval(function(){
						if(msg.attachments.array()[0] != undefined && msg.attachments.array()[0].id != undefined){
							xLimit > 1 ? msg.react('\u{274c}') : msg.delete();
							clearInterval(checkx);
						}
						else if(msg.embeds[0] != undefined){
							xLimit > 1 ? msg.react('\u{274c}') : msg.delete();
							clearInterval(checkx);
						}
						else if(checkcount >= 3){
							clearInterval(checkx);
						}
						checkcount++;
					}, 1000);
				}
			}
		}
		let itemChannelIDs = client.provider.get(msg.guild, 'itemChannelIDs', null);
		if(itemChannelIDs && itemChannelIDs.includes(msg.channel.id)){
			if(getRandomInt(0, 100) === 100){
				let duelstats = msg.client.provider.get(msg.guild, "duelstats" + msg.author.id, null);
				if(duelstats){
					duelstats.items.push(generateNewItem());
					msg.client.provider.set(msg.guild, "duelstats" + msg.author.id, duelstats);
				}
				else{
					duelstats = {items: [generateNewItem()], equipped: [null, null, null]};
					msg.client.provider.set(msg.guild, "duelstats" + msg.author.id, duelstats);
				}
				if(msg.client.provider.get(msg.guild, 'optlist', []).includes(msg.author.id)){
					msg.author.send(`You have gained an item: ${createDescString(duelstats.items[duelstats.items.length-1])}`)
				}
			}
		}
		if(msg.content.toLowerCase().includes("press 🇫 to pay respects") || msg.content.toLowerCase().includes("press f to pay respects")){
			msg.react('\u{1f1eb}')
		}
		if(!msg.author.bot){
			let tumbleweedChannelIDs = client.provider.get(msg.guild, 'tumbleweedChannelIDs', []);
			if(tumbleweedChannelIDs.includes(msg.channel.id)){
				if(msg.attachments.array()[0] != undefined && msg.attachments.array()[0].filename.toLowerCase().includes("tumbleweed")){
					//real mistake hours hit that tumbleweed if you up
					let prevMessages = msg.channel.messages.array();
					if(!prevMessages.indexOf(msg) - 1 < 0){
						let tumbleweedLeaderboard = client.provider.get(msg.guild, 'tumbleweedLeaderboard', []);
						let tumbleDate = msg.createdAt;
						let prevDate = prevMessages[prevMessages.indexOf(msg) - 1].createdAt;
						let minuteDifference = Math.round((tumbleDate-prevDate)/1000/60);
						let entryIndex = tumbleweedLeaderboard.findIndex(function(element){return element.id === msg.author.id});
						if(entryIndex > -1){
							if(minuteDifference > tumbleweedLeaderboard[entryIndex].score){
								tumbleweedLeaderboard[entryIndex] = {
									score: minuteDifference,
									username: msg.author.username,
									id: msg.author.id
								}
							}
						}
						else{
							tumbleweedLeaderboard.push(
								{
									score: minuteDifference,
									username: msg.author.username,
									id: msg.author.id
								}
							);
						}
						client.provider.set(msg.guild, 'tumbleweedLeaderboard', tumbleweedLeaderboard);
					}
				}
			}
			let memeChannelIDs = client.provider.get(msg.guild, 'memeChannelIDs', null);
			if(memeChannelIDs != null){
				let customCommands = client.provider.get(msg.guild, 'customCommands', []);
				let commandInput = msg.content;
				let prefix = client.provider.get(msg.guild, 'prefix', client.commandPrefix)
				if(commandInput.slice(0,prefix.length) === prefix){
					commandInput = commandInput.slice(prefix.length).toLowerCase();
					let commandIndex = customCommands.findIndex(function(element){return element.name.toLowerCase() === commandInput});
					if(commandIndex > -1){
						if(memeChannelIDs.includes(msg.channel.id) || 
						 msg.client.isOwner(msg.author) ||
						 msg.member.permissions.has('MANAGE_MESSAGES')){
							msg.channel.send(customCommands[commandIndex].output);
						}
						else{
							msg.reply("You do not have permission to use that in this channel.")
						}
					}
				}
			}
		}
	})
	.on('messageUpdate', (oldmsg, newmsg) => {
		let xChannelIDs = client.provider.get(newmsg.guild, 'xChannelIDs', null);
		if(xChannelIDs != null){
			if(xChannelIDs.includes(newmsg.channel.id)){
				let xLimit = client.provider.get(newmsg.guild, 'xLimit' + newmsg.channel.id, 7)
				let emoji = [];
				let unicodeEmoji = newmsg.content.match(emojiRegex());
				let customEmoji = newmsg.content.match(/<:\w\w*:\d\d*>/ig);
				if(unicodeEmoji){
					emoji = emoji.concat(unicodeEmoji)
				}
				if(customEmoji){
					emoji = emoji.concat(customEmoji)
				}
				if(emoji.length >= 4){
					xLimit > 1 ? newmsg.react('\u{274c}') : newmsg.delete();
				}
				else{
					let checkcount = 0
					let checkx = setInterval(function(){
						if(newmsg.attachments.array()[0] != undefined && newmsg.attachments.array()[0].id != undefined){
							xLimit > 1 ? newmsg.react('\u{274c}') : newmsg.delete();
							clearInterval(checkx);
						}
						else if(newmsg.embeds[0] != undefined){
							xLimit > 1 ? newmsg.react('\u{274c}') : newmsg.delete();
							clearInterval(checkx);
						}
						else if(checkcount >= 3){
							clearInterval(checkx);
						}
						checkcount++;
					}, 1000);
				}
			}
		}
	})
	.on('messageReactionAdd', (rea, user) => {
		let xBlacklistIDs = client.provider.get(rea.message.guild, 'blacklist', {}).x;
		let xChannelIDs = client.provider.get(rea.message.guild, 'xChannelIDs', []);
		let blacklisted = 0;
		let reactUsers = rea.users.array()
		if(!Array.isArray(xBlacklistIDs)){
			xBlacklistIDs = [];
		}
		if(rea.me === true && rea.emoji.name === "❌"){
			for(var i = 0; i < xBlacklistIDs.length; i++){
				if(typeof reactUsers.find(function(element){return element.name === xBlacklistIDs[i]}) === 'string'){
					blacklisted++;
				}
			}
			if(rea.count-1-blacklisted >= client.provider.get(rea.message.guild, 'xLimit' + rea.message.channel.id, 7) && xChannelIDs.includes(rea.message.channel.id)){
				let xlogChannelIDs = client.provider.get(rea.message.guild, 'xlogChannelIDs', []);
				let logMessage = `Deleted ${rea.message.member.displayName}[${rea.message.author.id}]'s message[${rea.message.id}] in ${rea.message.channel}`
				let messageAttachments = rea.message.attachments.array();
				if(messageAttachments[0] != undefined && messageAttachments[0].id != undefined){
					logMessage += " containing a message attachment";
				}
				if(rea.message.embeds[0] != undefined){
					if(messageAttachments[0] != undefined && messageAttachments[0].id != undefined){
						logMessage += " and";
					}
					else{
						logMessage += " containing";
					}
					logMessage += " the following embeds:\n"
					for(i = 0; i < rea.message.embeds.length; i++){
						logMessage += `<${rea.message.embeds[i].url}>\n`;
					}
				}
				sendMessages(xlogChannelIDs, logMessage)
				rea.message.delete();
			}
			else if(rea.message.author.id != client.user.id && rea.users.get(rea.message.author.id) != undefined){
				rea.message.delete();
			}
		}
	})
	.on('voiceStateUpdate', (oldMember, newMember) => {
		let voiceChannelIDs = client.provider.get(oldMember.guild, 'voiceChannelIDs', null);
		if(voiceChannelIDs != null){
			//compare old channel state to new channel state
			if(oldMember.voiceChannel === undefined && newMember.voiceChannel != undefined){
				sendMessages(voiceChannelIDs, `**${oldMember.displayName}** joined **${newMember.voiceChannel.name}**.`);
			}
			else if(oldMember.voiceChannel != undefined && newMember.voiceChannel === undefined){
				sendMessages(voiceChannelIDs, `**${oldMember.displayName}** left **${oldMember.voiceChannel.name}**.`);
			}
			else if(oldMember.voiceChannel != undefined && newMember.voiceChannel != undefined && newMember.voiceChannel.id != oldMember.voiceChannel.id){
				sendMessages(voiceChannelIDs, `**${oldMember.displayName}** moved to **${newMember.voiceChannel.name}** from **${oldMember.voiceChannel.name}**.`);
			}
		}
	})
	.on('commandError', (cmd, err) => {
		if(err instanceof commando.FriendlyError) return;
		console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
	})
	.on('commandBlocked', (msg, reason) => {
		console.log(oneLine`
			Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
			blocked; ${reason}
		`);
	})
	.on('commandPrefixChange', (guild, prefix) => {
		console.log(oneLine`
			Prefix ${prefix === '' ? 'removed' : `changed to ${prefix || 'the default'}`}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	})
	.on('commandStatusChange', (guild, command, enabled) => {
		console.log(oneLine`
			Command ${command.groupID}:${command.memberName}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	})
	.on('groupStatusChange', (guild, group, enabled) => {
		console.log(oneLine`
			Group ${group.id}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	});

client.setProvider(
	sqlite.open(path.join(__dirname, 'database.sqlite3')).then(db => new commando.SQLiteProvider(db))
).catch(console.error);

client.registry
	.registerGroups([
	['meme', 'Meme commands || group name "meme"'],
	['channel', 'Channel settings || group name "channel"'],
	['custom', 'Custom command commands || group name "custom"'],
	['role', 'Role commands || group name "role"'],
	['x', 'Embed flagging commands || group name "x"'],
	['suggest', 'Suggestion commands || group name "suggest"'],
	['mod', 'Moderator commands || group name "mod"']
	])
	.registerDefaults()
	.registerType(require("./guild.js"))
	.registerCommandsIn(path.join(__dirname, 'commands'));

client.login(config.token);

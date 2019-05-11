const Discord = require('discord.js')
const commando = require('discord.js-commando');
const path = require('path');
const oneLine = require('common-tags').oneLine;
const sqlite = require('sqlite');
const config = require('./config.json');
const prompt = require('prompt');
const emojiRegex = require('emoji-regex');
const moment = require('moment');
const fs = require('fs');
var duelconfig = require('./duel.json');
var tumbleweedDates = {};
const xStream = fs.createWriteStream('xLogs.txt', {flags: 'a'});
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

const client = new commando.Client({
	owner: config.owner,
	commandPrefix: config.prefix,
	unknownCommandResponse: false,
	invite: 'http://discord.gg/hAj5dY8'
});

function sendMessages(arr, content){
	for(var i = 0; i < arr.length; i++){
		try{
			client.channels.get(arr[i]).send(content)
		}
		catch(err){console.error(err)}
	}
}

function getRandomInt(min, max){
	return Math.floor(Math.random() * (max - min + 1) + min);
}
function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

function generateNewItem(){
	let item = {};
	item.quality = getRandomInt(1, 100) > 90 ? (getRandomInt(1, 100) > 90 ? "Legendary" : "Epic") : "Ordinary";
	let filteredtypes = duelconfig.types.filter(function(element){return element[item.quality.toLowerCase()]})
	let type = filteredtypes[getRandomInt(0,filteredtypes.length-1)];
	item.type = type.name;
	item.moveset = type.moveset ? true : false;
	item.mag = item.quality === "Legendary" ? getRandomInt(type.max*2+1,type.max*3) : (item.quality === "Epic" ? getRandomInt(type.max+1,type.max*2) : getRandomInt(type.min,type.max));
	return item;
}

function createStringFromTemplate(template, variables) {
	return template.replace(new RegExp("\{([^\{]+)\}", "g"), function(_unused, varName){
		return variables[varName];
	});
}

function createDescString(item){
	if(!item) return "None";
	else if(item.template) return `${item.quality} quality: ${createStringFromTemplate(item.template, {mag: item.mag})}`;
	else return `${item.quality} quality: ${createStringFromTemplate(duelconfig.types.find(element => {return element.name === item.type}).template, {mag: item.mag})}`;
}

client.dispatcher.addInhibitor((msg) => {
	if(msg.client.isOwner(msg.author)) return false;
	let gblacklist = client.provider.get('global', 'blacklist', []);
	let blacklist = client.provider.get(msg.guild, 'blacklist', {});
	if(gblacklist.includes(msg.author.id)) return true;
	if(blacklist.server && blacklist.server.includes(msg.author.id)) return true;
	if(!msg.command) return false;
	if((blacklist[msg.command.group.id] && blacklist[msg.command.group.id].includes(msg.author.id))
	 || (blacklist[msg.command.name] && blacklist[msg.command.name].includes(msg.author.id))){
		return true;
	}
	return false;
});

client
	.on('error', console.error)
	.on('warn', console.warn)
	.on('debug', console.log)
	.on('ready', () => {
		try{
		console.log(`Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
		client.user.setActivity(config.game)
		setInterval(function(){
		try{
			let times = client.provider.get('global', 'times', []);
			for(var i = 0; i < times.length; i++){
				if(moment.utc().isAfter(times[i].time)){
					let recipient = client.users.get(times[i].user);
					if(recipient) client.users.get(times[i].user).send(`You asked to be reminded at ${moment.utc(times[i].time).format('MMMM Do YYYY, h:mm:ss a ZZ')} of:  ${times[i].message}`)
					times.splice(i, 1)
				}
			}
			return client.provider.set('global', 'times', times);
		}
		catch(err){console.error(err)}
		}, 60000)
		}
		catch(err){console.error(err)}
	})
	.on('disconnect', () => { console.warn('Disconnected!'); })
	.on('reconnecting', () => { console.warn('Reconnecting...'); })
	.on('message', (msg) => {
		try{
		if(msg.content.toLowerCase().includes("press 🇫 to pay respects") || msg.content.toLowerCase().includes("press f to pay respects")) msg.react('\u{1f1eb}');
		(function(){
			let xChannelIDs = client.provider.get(msg.guild, 'xChannelIDs', []);
			if(!xChannelIDs.includes(msg.channel.id)) return false;
			if(!msg.channel.xRecentMessages) msg.channel.xRecentMessages = [];
			msg.channel.xRecentEmbeds = [];
			let xActivityTime = client.provider.get(msg.guild, 'xActivityTime'+msg.channel.id, 1200000);
			let xEmbedTime = client.provider.get(msg.guild, 'xEmbedTime'+msg.channel.id, 5000);
			let xActivityRatio = client.provider.get(msg.guild, 'xActivityRatio'+msg.channel.id, 0.25);
			let xEmbedPenalty = client.provider.get(msg.guild, 'xEmbedPenalty'+msg.channel.id, 2);
			let xMin = client.provider.get(msg.guild, 'xMin'+msg.channel.id, 1);
			let xMax = client.provider.get(msg.guild, 'xMax'+msg.channel.id, 30);
			let currentTime = new Date();
			msg.channel.xRecentMessages.push(msg);
			let i = 0;
			while(msg.channel.xRecentMessages[i] && msg.channel.xRecentMessages[i].createdAt < currentTime-xActivityTime){
				i++;
			};
			msg.channel.xRecentMessages.splice(0,i);
			i = msg.channel.xRecentMessages.length-1;
			while(msg.channel.xRecentMessages[i] && msg.channel.xRecentMessages[i].createdAt > currentTime-xEmbedTime){
				if(msg.channel.xRecentMessages[i].embeds[0] || msg.channel.xRecentMessages[i].attachments.array()[0]) msg.channel.xRecentEmbeds.push(msg.channel.xRecentMessages[i]);
				i--;
			};
			let uniqueIDs = [];
			for(let message of msg.channel.xRecentMessages){
				if(!uniqueIDs.includes(message.author.id)) uniqueIDs.push(message.author.id);
				if(message.reactions){
					message.reactions.forEach(reaction => {
						reaction.users.forEach(user => {
							if(!uniqueIDs.includes(user.id)) uniqueIDs.push(user.id);
						});
					});
				};
			};
			let sentEmbeds = 0;
			for(let message of msg.channel.xRecentEmbeds){
				if(message.author.id === msg.author.id) sentEmbeds += message.embeds.length + message.attachments.array().length;
			};
			let xCountRequired = Math.max(Math.min(Math.ceil(xActivityRatio * uniqueIDs.length - xEmbedPenalty * sentEmbeds), xMax), xMin)
			if(msg.guild.id === "163175631562080256") xStream.write(`${new Date().getTime()} ${msg.channel.name} ${msg.author.tag} ${msg.author.id} ${xCountRequired} ${sentEmbeds}\n`);
			return msg.xCountRequired = xCountRequired;
		})();
		if(!msg.author.bot){
			(function(){
				let itemChannelIDs = client.provider.get(msg.guild, 'itemChannelIDs', null);
				if(!itemChannelIDs) return false;
				if(!itemChannelIDs.includes(msg.channel.id)) return false;
				if(getRandomInt(1, 100) === 100){
					let duelstats = msg.client.provider.get(msg.guild, "duelstats", {});
					if(duelstats[msg.author.id]){
						duelstats[msg.author.id].items.push(generateNewItem());
						msg.client.provider.set(msg.guild, "duelstats", duelstats);
					}
					else{
						duelstats[msg.author.id] = {items: [generateNewItem()], equipped: [null, null, null]};
						msg.client.provider.set(msg.guild, "duelstats", duelstats);
					}
					if(msg.client.provider.get(msg.guild, 'optlist', []).includes(msg.author.id)) return msg.author.send(`You have gained an item: ${createDescString(duelstats[msg.author.id].items[duelstats[msg.author.id].items.length-1])}`);
				}
				return true;
			})();
			(function(){
				var tumbleweedChannelIDs = client.provider.get(msg.guild, 'tumbleweedChannelIDs', []);
				if(!tumbleweedChannelIDs.includes(msg.channel.id)) return false;
				let prevDate = tumbleweedDates[msg.channel.guild.id] ? tumbleweedDates[msg.channel.guild.id][msg.channel.id] ? tumbleweedDates[msg.channel.guild.id][msg.channel.id] : msg.createdAt : msg.createdAt;
				let minuteDifference = Math.floor((msg.createdAt-prevDate)/1000/60);
				(function(){
					if(!tumbleweedDates[msg.channel.guild.id]) tumbleweedDates[msg.channel.guild.id] = {};
					tumbleweedDates[msg.channel.guild.id][msg.channel.id] = msg.createdAt;
				})();
				if(!msg.attachments.array()[0]) return false;
				if(!msg.attachments.array()[0].name.toLowerCase().includes("tumbleweed")) return false;
				//real mistake hours hit that tumbleweed if you up
				let tumbleweedLeaderboard = client.provider.get(msg.guild, 'tumbleweedLeaderboard', []);
				//i've now realized far into the future that this is hella dumb but i'll fix it later
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
				return client.provider.set(msg.guild, 'tumbleweedLeaderboard', tumbleweedLeaderboard);
			})();
			(function(){
				let memeChannelIDs = client.provider.get(msg.guild, 'memeChannelIDs', null);
				if(!memeChannelIDs) return false;
				let customBlacklistIDs = client.provider.get(msg.guild, 'blacklist', {}).custom;
				if(Array.isArray(customBlacklistIDs) && customBlacklistIDs.includes(msg.author.id)) return false;
				let customCommands = client.provider.get(msg.guild, 'customCommands', []);
				let commandInput = msg.content;
				let prefix = client.provider.get(msg.guild, 'prefix', client.commandPrefix)
				if(commandInput.slice(0,prefix.length) != prefix) return false;
				commandInput = commandInput.slice(prefix.length).toLowerCase();
				let commandIndex = customCommands.findIndex(element => {return element.name.toLowerCase() === commandInput});
				if(commandIndex <= -1) return false;
				if(memeChannelIDs.includes(msg.channel.id) || msg.client.isOwner(msg.author) || msg.member.permissions.has('MANAGE_MESSAGES')) return msg.channel.send(customCommands[commandIndex].output);
				else return msg.reply("You do not have permission to use that in this channel.")
			})();
			(function(){
				if(!msg.guild || msg.guild.id != "163175631562080256") return false;
				let itemChannelIDs = client.provider.get(msg.guild, 'itemChannelIDs', null);
				if(!itemChannelIDs) return false;
				if(!itemChannelIDs.includes(msg.channel.id)) return false;
				if(getRandomInt(1, 10) === 10){
					let gacha = msg.client.provider.get(msg.guild, "gacha"+msg.author.id, {rolls:0,spirits:[]});
					gacha.rolls++
					return msg.client.provider.set(msg.guild, "gacha"+msg.author.id, gacha);
				}
			})();
		}
		}
		catch(err){console.error(err)}
	})
	.on('messageReactionAdd', (rea, user) => {
		try{
		if(!rea.message.xCountRequired || rea.emoji.name != "❌") return false;
		let xChannelIDs = client.provider.get(rea.message.guild, 'xChannelIDs', []);
		if(!xChannelIDs.includes(rea.message.channel.id)) return false;
		let xBlacklistIDs = client.provider.get(rea.message.guild, 'blacklist', {}).x;
		let reactUsers = rea.users.array()
		if(!Array.isArray(xBlacklistIDs)) xBlacklistIDs = [];
		let blacklisted = 0;
		for(var i = 0; i < xBlacklistIDs.length; i++){
			if(reactUsers.find(function(element){return element.id === xBlacklistIDs[i]})) blacklisted++;
		}
		if(rea.message.author.id != client.user.id && rea.users.get(rea.message.author.id)) return rea.message.delete();
		if(rea.count-blacklisted < rea.message.xCountRequired) return false;
		let xlogChannelIDs = client.provider.get(rea.message.guild, 'xlogChannelIDs', []);
		let logMessage = `Deleted ${rea.message.member.displayName}[${rea.message.author.id}]'s message[${rea.message.id}] in ${rea.message.channel}`
		let messageAttachments = rea.message.attachments.array();
		if(messageAttachments[0] && messageAttachments[0].id) logMessage += " containing a message attachment";
		if(rea.message.embeds[0]){
			logMessage += (messageAttachments[0] != undefined && messageAttachments[0].id != undefined) ? logMessage += " and" : " containing";
			logMessage += " the following embeds:\n"
			for(i = 0; i < rea.message.embeds.length; i++){
				logMessage += `<${rea.message.embeds[i].url}>\n`;
			}
		}
		sendMessages(xlogChannelIDs, logMessage)
		return rea.message.delete();
		}
		catch(err){console.error(err)}
	})
	.on('voiceStateUpdate', (oldState, newState) => {
		try{
		let voiceChannelIDs = client.provider.get(oldState.guild, 'voiceChannelIDs', null);
		if(!voiceChannelIDs) return false;
		//compare old channel state to new channel state
		if(!oldState.channelID && newState.channelID) return sendMessages(voiceChannelIDs, `**${oldState.member.displayName}** joined **${newState.channel.name}**.`);
		else if(oldState.channelID && !newState.channelID) return sendMessages(voiceChannelIDs, `**${oldState.member.displayName}** left **${oldState.channel.name}**.`);
		else if(oldState.channelID && newState.channelID && newState.channelID != oldState.channelID) return sendMessages(voiceChannelIDs, `**${oldState.member.displayName}** moved to **${newState.channel.name}** from **${oldState.channel.name}**.`);
		}
		catch(err){console.error(err)}
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
	})
	.on('commandRun', (command, promise, msg, args, fromPattern) => {
		console.log(`By ${msg.author.username}|${msg.author.id} in ${msg.guild ? `${msg.guild.name}|${msg.guild.id}` : 'DM channel'}`);
	});

client.setProvider(
	sqlite.open(path.join(__dirname, 'database.sqlite3')).then(db => new commando.SQLiteProvider(db))
).catch(console.error);

client.registry
	.registerGroups([
	['meme', 'meme'],
	['channel', 'channel'],
	['custom', 'custom'],
	['role', 'role'],
	['x', 'x'],
	['suggestion', 'suggestion'],
	['mod', 'mod'],
	['gacha', 'gacha'],
	['tts', 'tts'],
	['commands', 'commands', true],
	['util', 'util']
	])
	.registerDefaultTypes()
	.registerDefaultCommands()
	.registerType(require("./guild.js"))
	.registerType(require("./time.js"))
	.registerType(require("./memberexclude.js"))
	.registerCommandsIn(path.join(__dirname, 'commands'));

client.login(config.token);

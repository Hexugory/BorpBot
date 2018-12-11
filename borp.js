const Discord = require('discord.js')
const commando = require('discord.js-commando');
const path = require('path');
const oneLine = require('common-tags').oneLine;
const sqlite = require('sqlite');
const config = require('./config.json');
const prompt = require('prompt');
const emojiRegex = require('emoji-regex');
const moment = require('moment');
const ms = require('./minestat');
var duelconfig = require('./duel.json');
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
	if(!msg.command) return false;
	if((blacklist[msg.command.group.id] && blacklist[msg.command.group.id].includes(msg.author.id))
	 || (blacklist[msg.command.name] && blacklist[msg.command.name].includes(msg.author.id))
	 || (blacklist.server && blacklist.server.includes(msg.author.id))){
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
		if(client.user.id === "164203810082914304"){
			client.guilds.get("163175631562080256").channels.get("163495560626700288").messages.fetch('393227876649926667')
			.then(msg => message = msg)
			.catch(console.error);
			setInterval(function(){
				var embed = new Discord.MessageEmbed();
				ms.init('mamizou.net', 25565, function(result){
					embed.setAuthor('Modded Minecraft Server')
					if(ms.online){
						embed.setFooter('Online')
						embed.setColor([0, 150, 0])
					}
					else{
						embed.setFooter('Offline')
						embed.setColor([150, 0, 0])
					}
					embed.setDescription(`Players: ${ms.current_players ? ms.current_players : 0}/${ms.max_players ? ms.max_players : 0}\nIP: ${ms.address}:${ms.port}\nPack: FTB Infinity Evolved`)
					message.edit(embed)
				});
			}, 600000)
		}
		}
		catch(err){console.error(err)}
	})
	.on('disconnect', () => { console.warn('Disconnected!'); })
	.on('reconnecting', () => { console.warn('Reconnecting...'); })
	.on('message', (msg) => {
		try{
		(function(){
			let xChannelIDs = client.provider.get(msg.guild, 'xChannelIDs', null);
			if(!xChannelIDs || !xChannelIDs.includes(msg.channel.id)) return false;
			let xLimit = client.provider.get(msg.guild, 'xLimit' + msg.channel.id, 7)
			let emoji = [];
			let unicodeEmoji = msg.content.match(emojiRegex());
			let customEmoji = msg.content.match(/<:\w\w*:\d\d*>/ig);
			if(unicodeEmoji) emoji = emoji.concat(unicodeEmoji)
			if(customEmoji) emoji = emoji.concat(customEmoji)
			if(emoji.length >= 4) return xLimit > 1 ? msg.react('\u{274c}').catch(err => {err.code === 90001 ? msg.delete() : null}) : msg.delete();
			let checkcount = 0
			let checkx = setInterval(function(){
				if((msg.attachments.array()[0] && msg.attachments.array()[0].id) || msg.embeds[0] || msg.content.match(/(https?:\/\/)?(www.)?discord.gg\/[\w\d]+/)){
					xLimit > 1 ? msg.react('\u{274c}').catch(err => {err.code === 90001 ? msg.delete() : null}) : msg.delete();
					return clearInterval(checkx);
				}
				else if(checkcount >= 3) return clearInterval(checkx);
				checkcount++;
			}, 1000);
			return true
		})();
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
		if(msg.content.toLowerCase().includes("press 🇫 to pay respects") || msg.content.toLowerCase().includes("press f to pay respects")) msg.react('\u{1f1eb}')
		if(!msg.author.bot){
		(function(){
			let tumbleweedChannelIDs = client.provider.get(msg.guild, 'tumbleweedChannelIDs', []);
			if(!tumbleweedChannelIDs.includes(msg.channel.id)) return false;
			if(!msg.attachments.array()[0]) return false;
			if(!msg.attachments.array()[0].name.toLowerCase().includes("tumbleweed")) return false
			//real mistake hours hit that tumbleweed if you up
			let prevMessages = msg.channel.messages.array();
			let prevIndex = prevMessages.indexOf(msg);
			if(prevIndex - 1 < 0) return false;
			let tumbleweedLeaderboard = client.provider.get(msg.guild, 'tumbleweedLeaderboard', []);
			let tumbleDate = msg.createdAt;
			let prevDate = prevMessages[prevIndex - 1].createdAt;
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
			return client.provider.set(msg.guild, 'tumbleweedLeaderboard', tumbleweedLeaderboard);
		})();
		(function(){
			let memeChannelIDs = client.provider.get(msg.guild, 'memeChannelIDs', null);
			if(!memeChannelIDs) return false;
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
			if(msg.guild.id != "163175631562080256") return false;
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
	.on('messageUpdate', (oldmsg, newmsg) => {
		try{
		let xChannelIDs = client.provider.get(newmsg.guild, 'xChannelIDs', null);
		if(!xChannelIDs) return false;
		if(!xChannelIDs.includes(newmsg.channel.id)) return false;
		let xLimit = client.provider.get(newmsg.guild, 'xLimit' + newmsg.channel.id, 7)
		let emoji = [];
		let unicodeEmoji = newmsg.content.match(emojiRegex());
		let customEmoji = newmsg.content.match(/<:\w\w*:\d\d*>/ig);
		if(unicodeEmoji) emoji = emoji.concat(unicodeEmoji)
		if(customEmoji) emoji = emoji.concat(customEmoji)
		if(emoji.length >= 4) return xLimit > 1 ? newmsg.react('\u{274c}').catch(err => {err.code === 90001 ? newmsg.delete() : null}) : newmsg.delete();
		let checkcount = 0
		let checkx = setInterval(function(){
			if((newmsg.attachments.array()[0] && newmsg.attachments.array()[0].id) || newmsg.embeds[0] || newmsg.content.match(/(https?:\/\/)?(www.)?discord.gg\/[\w\d]+/)){
				xLimit > 1 ? newmsg.react('\u{274c}').catch(err => {err.code === 90001 ? newmsg.delete() : null}) : newmsg.delete();
				return clearInterval(checkx);
			}
			else if(checkcount >= 3) return clearInterval(checkx);
			checkcount++;
		}, 1000);
		return true;
		}
		catch(err){console.error(err)}
	})
	.on('messageReactionAdd', (rea, user) => {
		try{
		let xBlacklistIDs = client.provider.get(rea.message.guild, 'blacklist', {}).x;
		let xChannelIDs = client.provider.get(rea.message.guild, 'xChannelIDs', []);
		let reactUsers = rea.users.array()
		if(!Array.isArray(xBlacklistIDs)) xBlacklistIDs = [];
		if(!rea.me || rea.emoji.name != "❌") return false;
		let blacklisted = 0;
		for(var i = 0; i < xBlacklistIDs.length; i++){
			if(reactUsers.find(function(element){return element.id === xBlacklistIDs[i]})) blacklisted++;
		}
		if(rea.message.author.id != client.user.id && rea.users.get(rea.message.author.id)) return rea.message.delete();
		if(rea.count-blacklisted < client.provider.get(rea.message.guild, 'xLimit' + rea.message.channel.id, 7) || !xChannelIDs.includes(rea.message.channel.id)) return false;
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
	.on('voiceStateUpdate', (oldMember, newMember) => {
		try{
		let voiceChannelIDs = client.provider.get(oldMember.guild, 'voiceChannelIDs', null);
		if(!voiceChannelIDs) return false;
		//compare old channel state to new channel state
		if(!oldMember.voiceChannelID && newMember.voiceChannelID) return sendMessages(voiceChannelIDs, `**${oldMember.displayName}** joined **${newMember.voiceChannel.name}**.`);
		else if(oldMember.voiceChannelID && !newMember.voiceChannelID) return sendMessages(voiceChannelIDs, `**${oldMember.displayName}** left **${oldMember.voiceChannel.name}**.`);
		else if(oldMember.voiceChannelID && newMember.voiceChannelID && newMember.voiceChannelID != oldMember.voiceChannelID) return sendMessages(voiceChannelIDs, `**${oldMember.displayName}** moved to **${newMember.voiceChannel.name}** from **${oldMember.voiceChannel.name}**.`);
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
	});
	.on('commandRun', (command, promise, msg, args, fromPattern) => {
		console.log(`By ${msg.author.username}|${msg.author.id} in ${msg.guild.name}|${msg.guild.id}`);
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
	['gacha', 'gacha']
	])
	.registerDefaults()
	.registerType(require("./guild.js"))
	.registerType(require("./time.js"))
	.registerType(require("./memberexclude.js"))
	.registerCommandsIn(path.join(__dirname, 'commands'));

client.login(config.token);

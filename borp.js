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

var promptChannel = "";

function sendMessages(arr, content){
	for(i = 0; i < arr.length; i++){
		try{
			client.channels.get(arr[i]).send(content)
		}
		catch(err){console.log(err)}
	}
}

client.dispatcher.addInhibitor((msg) => {
	let blacklist = client.provider.get('global', 'blacklist', []);
	let serverBlacklist = client.provider.get(msg.guild, 'serverBlacklistIDs', []);
	if(!blacklist.includes(msg.author.id) && !serverBlacklist.includes(msg.author.id)){
		return false;
	}
	else{
		return true;
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
		let xBlacklistIDs = client.provider.get(rea.message.guild, 'xBlacklistIDs', []);
		let blacklisted = 0;
		let reactUsers = rea.users.array()
		if(rea.me === true && rea.emoji.name === "❌"){
			for(var i = 0; i < xBlacklistIDs.length; i++){
				if(typeof reactUsers.find(function(element){return element.name === xBlacklistIDs[i]}) === 'string'){
					blacklisted++;
				}
			}
			if(rea.count-1-blacklisted >= client.provider.get(rea.message.guild, 'xLimit' + rea.message.channel.id, 7)){
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
	['meme', 'Meme commands'],
	['channel', 'Channel settings'],
	['other', 'Not meme commands'],
	['custom', 'Custom command commands']
	])
	.registerDefaults()
	.registerCommandsIn(path.join(__dirname, 'commands'));

client.login(config.token);

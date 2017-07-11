const commando = require('discord.js-commando');
const path = require('path');
const oneLine = require('common-tags').oneLine;
const sqlite = require('sqlite');
const config = require('./config.json');
const prompt = require('prompt');

const client = new commando.Client({
	owner: config.owner,
	commandPrefix: '\'',
	unknownCommandResponse: false,
	invite: 'http://discord.gg/PaZzcx5'
});

var promptChannel = "";

function sendMessages(arr, content){
	for(i = 0; i < arr.length; i++){
		client.channels.get(arr[i]).send(content)
	}
}

client.dispatcher.addInhibitor((msg) => {
	let blacklist = client.provider.get('global', 'blacklist', []);
	let serverBlacklist = client.provider.get(msg.guild, 'serverBlacklistIDs', []);
	if(!blacklist.includes(msg.author.id) && !serverBlacklist.includes(msg.author.id)){
		return false;
	}
	else{
		return `User ${msg.author.username}#${msg.author.discriminator} (${msg.author.id}) has been blacklisted.`;
	}
});

client
	.on('error', console.error)
	.on('warn', console.warn)
	.on('debug', console.log)
	.on('ready', () => {
		console.log(`Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
		client.user.setGame(config.game)
	})
	.on('disconnect', () => { console.warn('Disconnected!'); })
	.on('reconnecting', () => { console.warn('Reconnecting...'); })
	.on('message', (msg) => {
		let xChannelIDs = client.provider.get(msg.guild, 'xChannelIDs', null);
		if(xChannelIDs != null){
			if(xChannelIDs.includes(msg.channel.id)){
				//this totally isnt inefficient at all
				let checkcount = 0
				let checkx = setInterval(function(){
					if(msg.attachments.array()[0] != undefined && msg.attachments.array()[0].id != undefined){
						msg.react('\u{274c}');
						clearInterval(checkx);
					}
					else if(msg.embeds[0] != undefined && (msg.embeds[0].type === 'video' || msg.embeds[0].type === 'image')){
						msg.react('\u{274c}');
						clearInterval(checkx);
					}
					else if(checkcount >= 3){
						clearInterval(checkx);
					}
					checkcount++;
				}, 1000);
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
				if(commandInput.slice(0,1) === "'"){
					commandInput = commandInput.slice(1).toLowerCase();
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
	.on('messageReactionAdd', (rea, user) => {
		let xBlacklistIDs = client.provider.get(rea.message.guild, 'xBlacklistIDs', []);
		if(rea.me === true && rea.emoji.name === "❌"){
			if(xBlacklistIDs.includes(user.id)){
				rea.remove(user)
				.catch(console.error)
			}
			else if(rea.count >= client.provider.get(rea.message.guild, 'xLimit' + rea.message.channel.id, 7)){
				let xlogChannelIDs = client.provider.get(rea.message.guild, 'xlogChannelIDs', null);
				let logMessage = `Deleted ${rea.message.member.displayName}[${rea.message.author.id}]'s message in ${rea.message.channel}`
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
	['other', 'Not meme commands']
	])
	.registerDefaults()
	.registerCommandsIn(path.join(__dirname, 'commands'));

client.login(config.token);

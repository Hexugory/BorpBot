const commando = require('discord.js-commando');
const path = require('path');
const oneLine = require('common-tags').oneLine;
const sqlite = require('sqlite');
const config = require('./config.json');
const mMessages = require('./perms.js').mMessages;
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
		client.channels.get(arr[i]).sendMessage(content)
	}
}

client.dispatcher.addInhibitor((msg) => {
	let blacklist = client.provider.get('global', 'blacklist', []);
	if(!blacklist.includes(msg.author.id)){
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
				setTimeout(function(){
					if(msg.attachments.array()[0] != undefined){
						if(msg.attachments.array()[0].id != undefined){
							msg.react('\u{274c}')
						}
					}
					if(msg.embeds[0] != undefined){
						if(msg.embeds[0].type === 'video' || msg.embeds[0].type === 'image'){
							msg.react('\u{274c}')
						}
					}
				}, 1000);
			}
		}
		if(!msg.author.bot){
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
						 msg.member.hasPermission(mMessages)){
							msg.channel.sendMessage(customCommands[commandIndex].output);
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
		if(rea.me === true){
			if(rea.users.get(rea.message.author.id) != undefined || rea.count >= 7){
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

function speechPrompt(){
	try{
		prompt.get(['send'], function (err, result) {
			if(result.send.startsWith('channel ')){
				promptChannel = result.send.slice(8);
				console.log(`Channel set to ${client.channels.get(promptChannel).name}`);
				return speechPrompt();
			}
			else{
				let promptDest = client.channels.get(promptChannel);
				result.send = result.send.replace("\\r", "\r")
				promptDest.sendMessage(result.send);
				console.log(`Sending ${result.send} to ${promptDest.name}`);
				return speechPrompt();
			}
		});
	}
	catch(e){console.log(e)};
}

client.login(config.token);
speechPrompt();

/* eslint-disable no-console */
const commando = require('discord.js-commando');
const path = require('path');
const oneLine = require('common-tags').oneLine;
const sqlite = require('sqlite');
const config = require('./config.json');
const mMessages = require('./perms.js').mMessages;

const client = new commando.Client({
	owner: '157704875726209025',
	commandPrefix: '\'',
	unknownCommandResponse: false,
	invite: 'http://discord.gg/PaZzcx5'
});

function sendMessages(arr, content){
	for(i = 0; i < arr.length; i++){
		client.channels.get(arr[i]).sendMessage(content)
	}
}

client
	.on('error', console.error)
	.on('warn', console.warn)
	.on('debug', console.log)
	.on('ready', () => {
		console.log(`Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
	})
	.on('disconnect', () => { console.warn('Disconnected!'); })
	.on('reconnecting', () => { console.warn('Reconnecting...'); })
	.on('message', (msg) => {
		let xChannelIDs = client.provider.get(msg.guild, 'xChannelIDs', null);
		if(xChannelIDs != null){
			if(xChannelIDs.indexOf(msg.channel.id) > -1){
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
		let memeChannelIDs = client.provider.get(msg.guild, 'memeChannelIDs', null);
		if(memeChannelIDs != null){
			let customCommands = client.provider.get(msg.guild, 'customCommands', []);
			let commandInput = msg.content;
			if(commandInput.slice(0,1) === "'"){
				commandInput = commandInput.slice(1);
				let commandIndex = customCommands.findIndex(function(element){return element.name === commandInput});
				if(commandIndex > -1){
					if(memeChannelIDs.indexOf(msg.channel.id) > -1 || 
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
	})
	.on('messageReactionAdd', (rea, user) => {
		if(rea.me === true){
			if(rea.count >= 7){
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

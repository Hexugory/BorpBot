const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const jimp = require('jimp');
const mMessages = require('../../perms.js').mMessages;

module.exports = class AnnounceToggleCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'edgifier',
			group: 'meme',
			memberName: 'edgifier',
			description: 'Makes you edgier.',
			guildOnly: true,
			examples: ["'edgifier"]
		});
	}
	
	hasPermission(msg) {
		if(msg.client.isOwner(msg.author)){
			return true;
		}
		else if(msg.member.hasPermission(mMessages)){
			return true;
		}
		else{
			return msg.client.provider.get(msg.guild, 'memeChannelIDs', null).indexOf(msg.channel.id) > -1
		}
	}

	async run(msg, args) {
		let url = msg.author.avatarURL;
		url = url.substr(0, url.indexOf(url.slice(url.length - 14, url.length)))
		jimp.read(url + ".png?size=256").then(function(ava){
			ava.greyscale()
			.invert()
			.color([
			{ apply: 'blue', params: [ -9999 ] },
			{ apply: 'green', params: [ -9999 ] }
			]);
			ava.getBuffer(jimp.MIME_PNG, function(err, buffer){
				return msg.channel.sendFile(buffer);
			});
		}).catch(function(err){
			console.error(err);
			return msg.reply("Something went wrong.");
		});
	}
};

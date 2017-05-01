const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const jimp = require('jimp');
const mMessages = require('../../perms.js').mMessages;

module.exports = class EdgifierCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'edgifier',
			group: 'meme',
			memberName: 'edgifier',
			description: 'Makes you edgier.',
			examples: ["'edgifier"]
		});
	}
	
	hasPermission(msg) {
		if(msg.client.isOwner(msg.author)){
			return true;
		}
		else if(msg.member != null && msg.member.hasPermission(mMessages)){
			return true;
		}
		else{
			return msg.client.provider.get(msg.guild, 'memeChannelIDs', []).includes(msg.channel.id)
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
				return msg.channel.send({files: [{attachment: buffer,name: `Edgy-${msg.author.username}.png`}]});
			});
		}).catch(function(err){
			console.error(err);
			return msg.reply("Something went wrong.");
		});
	}
};

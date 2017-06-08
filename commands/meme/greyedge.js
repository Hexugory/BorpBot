const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const jimp = require('jimp');
const mMessages = require('../../perms.js').mMessages;

module.exports = class GreyEdgeCommand extends commando.Command {
	constructor(client) {
		super(client, {
			aliases: ['grayedge', 'gedge'],
			name: 'greyedge',
			group: 'meme',
			memberName: 'greyedge',
			description: 'Makes you edgier and grey.',
			examples: ["'greyedge"],
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
			.getBuffer(jimp.MIME_PNG, function(err, buffer){
				return msg.channel.send({files: [{attachment: buffer,name: `Edgy-${msg.author.username}.png`}]});
			});
		}).catch(function(err){
			console.error(err);
			return msg.reply("Something went wrong.");
		});
	}
};

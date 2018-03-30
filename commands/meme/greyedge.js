const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const jimp = require('jimp');

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
		return msg.client.isOwner(msg.author) || (msg.guild && (msg.member.permissions.has('MANAGE_MESSAGES') || msg.client.provider.get(msg.guild, 'memeChannelIDs', []).includes(msg.channel.id)))
	}

	async run(msg, args) {
		let url = msg.author.displayAvatarURL({format:'png',size:256});
		jimp.read(url).then(function(ava){
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

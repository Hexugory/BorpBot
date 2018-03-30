const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const jimp = require('jimp');

module.exports = class EdgifierCommand extends commando.Command {
	constructor(client) {
		super(client, {
			aliases: ['edge'],
			name: 'edgifier',
			group: 'meme',
			memberName: 'edgifier',
			description: 'Makes you edgier.',
			examples: ["'edgifier 180"],

			args: [
				{
					key: 'hue',
					label: 'hue',
					prompt: 'Enter hue.',
					type: 'integer',
					default: 0
				}
			]
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
			.color([
			{ apply: 'blue', params: [ -9999 ] },
			{ apply: 'green', params: [ -9999 ] },
			{ apply: 'hue', params: [ args.hue ] }
			])
			.getBuffer(jimp.MIME_PNG, function(err, buffer){
				return msg.channel.send({files: [{attachment: buffer,name: `Edgy-${msg.author.username}.png`}]});
			});
		}).catch(function(err){
			console.error(err);
			return msg.reply("Something went wrong.");
		});
	}
};

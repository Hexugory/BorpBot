const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const oneLine = require('common-tags').oneLine;

module.exports = class ListEmotesCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'listemotes',
			group: 'util',
			memberName: 'listemotes',
			description: oneLine`Send an imgur link (or multiple) to submit an emote(s).`,
			examples: ['\'listemotes'],
			guildOnly: true
		});
	}
	
	hasPermission(msg) {
		if(!(msg.guild && msg.guild.id === "163175631562080256")) return msg.client.isOwner(msg.author);
		let roles = msg.member.roles.array();
		let permissions = msg.client.provider.get(msg.guild, 'permissions', {mod:[]});
		if(!permissions.mod) return msg.client.isOwner(msg.author);
		if(permissions.mod.length < 1) return msg.client.isOwner(msg.author);
		for(var i = 0; i < roles.length; i++){
			if(permissions.mod.includes(roles[i].id)){
				return true;
			}
		}
		return msg.client.isOwner(msg.author);
	}

	async run(msg, args) {
		var emotes = msg.client.provider.get(msg.guild, "emotes", {});
		var values = Object.values(emotes)
		var sendstr = "";
		for(var i = 0; i < values.length; i++){
			sendstr += `[${values[i].username}]\n`
			for(var o = 0; o < values[i].links.length; o++){
				sendstr += `${values[i].links[o].name}: ${values[i].links[o].link}\n`
			}
		}
		return msg.reply({files: [{attachment: new Buffer(sendstr, 'utf-8'), name: `emotes.txt`}]})
	};
}
const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class WhatIsCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'whatis',
			group: 'meme',
			memberName: 'whatis',
			description: 'List all of someone\'s factoids.',
			examples: ['\'whatis @Guy Hero#7991', '\'whatis @Guy Hero#7991 Borpery'],
			guildOnly: true,
			
			args: [
				{
					key: 'mb',
					label: 'member',
					prompt: 'Specify member.',
					type: 'member'
				}
			]
		});
	}
	

	async run(msg, args) {
		var factoids = msg.client.provider.get(msg.guild, "factoids", {});
		if(!Array.isArray(factoids[args.mb.id])) return msg.reply("This person has no factoids.");
		var sendstr = `${args.mb} `
		for(var i = 0; i < factoids[args.mb.id].length; i++){
			sendstr += `(#${i+1}) ${factoids[args.mb.id][i]} `
		}
		return msg.channel.send(sendstr)
	}
};

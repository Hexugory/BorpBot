const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const oneLine = require('common-tags').oneLine;

module.exports = class SubmitEmoteCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'submitemote',
			group: 'util',
			memberName: 'submitemote',
			description: oneLine`Send an imgur link to submit an emote.`,
			examples: ['\'submitemote SanaeSmug https://i.imgur.com/lvZwvG8.jpg'],
			guildOnly: true,

			args: [
				{
					key: 'na',
					label: 'name',
					prompt: 'Enter emote name.',
					type: 'string'
				},
				{
					key: 'ln',
					label: 'imgur link',
					prompt: 'Enter imgur link.',
					type: 'string'
				}
			]
		});
	}
	
	hasPermission(msg) {
		return msg.client.isOwner(msg.author)
		|| (msg.guild && msg.guild.id === "163175631562080256");
	}

	async run(msg, args) {
		var emotes = msg.client.provider.get(msg.guild, "emotes", {});
		var imgur = /^https?:\/\/(i\.)?imgur\.com\/(\w*\d*\w*)+(\.[a-zA-Z]{3})?$/;
		if(!imgur.test(args.ln)) return msg.reply(`Invalid link.`);
		if(emotes[msg.author.id]) emotes[msg.author.id].links.push({link:args.ln, name:args.na});
		else emotes[msg.author.id] = {username: msg.author.username, links: [{link:args.ln, name:args.na}]};
		msg.client.provider.set(msg.guild, "emotes", emotes)
		return msg.reply(`\`${args.na}\` added.`)
	};
}
const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class NominateCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'nominate',
			group: 'suggestion',
			memberName: 'nominate',
			description: oneLine`Nominate a member of the server.
			Can send an optional text input.
			You can edit that text input by nominating the same person again.`,
			examples: ['\'nominate @Guy Hero#7991 good meme'],
			guildOnly: true,

			args: [
				{
					key: 'mb',
					label: 'member',
					prompt: 'Please enter a member.',
					type: 'memberexclude'
				},
				{
					key: 'tx',
					label: 'optional text input',
					prompt: 'Do you have anything to say with this nomination?',
					type: 'string',
					default: 0
				}
			]
		});
	}

	async run(msg, args) {
		let nominees = msg.client.provider.get(msg.guild, 'nominees', {});
		if(!nominees[args.mb.id]) nominees[args.mb.id] = {nominators: [], inputs: {}, username: args.mb.user.username};
		for(const nominee in nominees){
			if(nominees[nominee].nominators.includes(msg.author.id)) return msg.reply("You have already nominated someone.");
		}
		if(nominees[args.mb.id].nominators.includes(msg.author.id)){
			if(!args.tx){
				delete nominees[args.mb.id].inputs[msg.author.id];
				return msg.reply("Text input cleared.");
			}
			nominees[args.mb.id].inputs[msg.author.id] = {username: msg.author.username, input: args.tx};
			return msg.reply("Text input edited.");
		}
		nominees[args.mb.id].nominators.push(msg.author.id);
		if(args.tx) nominees[args.mb.id].inputs[msg.author.id] = {username: msg.author.username, input: args.tx};
		msg.client.provider.set(msg.guild, 'nominees', nominees);
		return msg.reply("Nomination sent.");
	};
}
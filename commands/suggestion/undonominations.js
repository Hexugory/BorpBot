const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class UndoNominationsCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'undonominations',
			group: 'suggestion',
			memberName: 'undonominations',
			description: oneLine`Undoes your nominations.`,
			examples: ['\'undonominations'],
			guildOnly: true
		});
	}

	async run(msg, args) {
		let nominees = msg.client.provider.get(msg.guild, 'nominees', {});
		for(const nominee in nominees){
			if(nominees[nominee].nominators.includes(msg.author.id)){
				nominees[nominee].nominators.splice(nominees[nominee].nominators.indexOf(msg.author.id), 1);
				for(const input in nominees[nominee].inputs){
					if(input === msg.author.id) delete nominees[nominee].inputs[input];
				}
			}
			if(!nominees[nominee].nominators.length) delete nominees[nominee];
		}
		return msg.reply("Nominations undone.")
		msg.client.provider.set(msg.guild, 'nominees', nominees);
	};
}
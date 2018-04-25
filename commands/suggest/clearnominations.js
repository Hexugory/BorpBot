const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class ClearNominationsCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'clearnominations',
			group: 'suggestion',
			memberName: 'clearnominations',
			description: 'Clears nominations.',
			examples: ['\'clearnominations']
		});
	}

	async run(msg, args) {
		msg.client.provider.set(msg.guild, 'nominees', {});
		return msg.reply("Nominations cleared.");
	};
}
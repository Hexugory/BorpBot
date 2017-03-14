const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class AnnounceToggleCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'custom',
			group: 'meme',
			memberName: 'custom',
			description: 'Lists custom commands.'
		});
	}
	

	async run(msg, args) {
		let customCommands = this.client.provider.get(msg.guild, 'customCommands', []);
		let commandList = "";
		for(var i = 0; i < customCommands.length; i++){
			commandList += `\`${customCommands[i].name}\` `
		}
		return msg.reply(commandList);
	}
};

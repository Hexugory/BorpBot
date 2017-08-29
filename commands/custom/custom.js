const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class ListCustomCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'custom',
			group: 'custom',
			memberName: 'custom',
			description: 'Lists custom commands.',
			guildOnly: true
		});
	}
	

	async run(msg, args) {
		let customCommands = await this.client.provider.get(msg.guild, 'customCommands', []);
		if(customCommands.length > 0){
			let commandList = "";
			for(var i = 0; i < customCommands.length; i++){
				commandList += `\`${customCommands[i].name}\` `
			}
			return msg.channel.send(commandList);
		}
		else{
			return msg.reply('This server has no custom commands.');
		}
	}
};

const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class UndoCustomCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'undo',
			group: 'meme',
			memberName: 'undo',
			description: 'Removes the last custom command.',
			examples: ['\'undo'],
			guildOnly: true
		});
	}
	

	async run(msg, args) {
		function findCommand(element){return element.name === args.name};
		let customCommands = this.client.provider.get(msg.guild, 'customCommands', []);
		let undone = this.client.provider.get(msg.guild, 'undone', true);
		if(undone === false){
			customCommands.length -= 1;
			this.client.provider.set(msg.guild, 'customCommands', customCommands);
			this.client.provider.set(msg.guild, 'undone', true);
			return msg.reply('Last command removed.');
		}
		else{
			return msg.reply('The last command made has already been undone, you cannot undo further.');
		}
	}
};

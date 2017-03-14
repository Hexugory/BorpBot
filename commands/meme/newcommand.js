const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class AnnounceToggleCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'newcommand',
			group: 'meme',
			memberName: 'newcommand',
			description: 'Adds a custom command.',
			examples: ['\'newcommand sumirekt http://i.imgur.com/yUKLbuc.jpg'],

			args: [
				{
					key: 'name',
					label: 'name',
					prompt: 'Enter command input.',
					type: 'string',
					default: 'blank'
				},
				{
					key: 'out',
					label: 'output',
					prompt: 'Enter command output',
					type: 'string',
					infinite: true,
					default: 'blank'
				}
			]
		});
	}
	
	

	async run(msg, args) {
			return msg.reply('Do not use backticks "`" in your command name.');
		}
		let customCommands = this.client.provider.get(msg.guild, 'customCommands', []);
		customCommands.push({
			name: args.name,
			output: args.out.join(" ")
		});
		this.client.provider.set(msg.guild, 'customCommands', customCommands);
		return msg.reply(`\`'${args.name}\` added.`);
	}
};

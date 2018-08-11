const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class RandomCaseCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'randomcase',
			group: 'meme',
			memberName: 'rart',
			description: 'Makes text rancomcase.',
			examples: ['\'randomcase hehe xd'],

			args: [
				{
					key: 'str',
					label: 'string',
					prompt: 'Please enter text.',
					type: 'string'
				}
			]
		});
	}
	

	async run(msg, args) {
		function getRandomInt(min, max){
			return Math.floor(Math.random() * (max - min + 1) + min);
		}
		var newstr = "";
		for(var i = 0; i < args.str.length; i++){
			let letter = args.str.toLowerCase().substring(i, i+1);
			if(getRandomInt(1, 2) === 2) letter = letter.toUpperCase();
			newstr += letter;
		}
		msg.reply(newstr);
	}
};

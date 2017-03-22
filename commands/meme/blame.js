const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class BlameCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'blame',
			group: 'meme',
			memberName: 'blame',
			description: 'Blame a user for your problems.',
			examples: ['\'blame'],
			guildOnly: true
		});
	}
	

	async run(msg, args) {
		var blame = [];
		msg.channel.fetchMessages({limit: 20})
		.then(messages => {
		for(var i = 0; i < messages.array().length; i++){
			if(!blame.includes(messages.array()[i].member.displayName)){
				blame.push(messages.array()[i].member.displayName)
			}
		}
		return msg.reply(`I blame ${blame[Math.floor(Math.random() * blame.length)]}.`);
		})
		.catch(console.error);
	}
};

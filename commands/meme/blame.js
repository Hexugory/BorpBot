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
		let messageArray = messages.array();
		for(var i = 0; i < messageArray.length; i++){
			let member = messageArray[i].member.displayName
			if(member != null){
				if(!blame.includes(member)){
					blame.push(member)
				}
			}
		}
		return msg.reply(`I blame ${blame[Math.floor(Math.random() * blame.length)]}.`);
		})
		.catch(console.error);
	}
};

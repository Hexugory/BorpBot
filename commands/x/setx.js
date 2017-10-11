const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');

module.exports = class xLimitCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'setx',
			group: 'x',
			memberName: 'setx',
			description: 'Set the amount of :x:s required to delete a message. (Manage Messages)',
			examples: ['\'setx 5'],
			guildOnly: true,

			args: [
				{
					key: 'xl',
					label: 'xl',
					default: 'a',
					prompt: 'Specify x limit.',
					type: 'integer'
				}
			]
		});
	}
	
	hasPermission(msg) {
		if(msg.client.isOwner(msg.author)){
			return true;
		}
		else{
			return msg.member.permissions.has('MANAGE_MESSAGES');
		}
	}

	async run(msg, args) {
		if(args.xl === 'a'){
			return msg.reply(`The current :x: limit in ${msg.channel} is ${this.client.provider.get(msg.guild, 'xLimit' + msg.channel.id, 7)}.`)
		}
		else{
			this.client.provider.set(msg.guild, 'xLimit' + msg.channel.id, args.xl);
			return msg.channel.send(`:x: limit set to ${args.xl} in ${msg.channel}.`);
		}
	};
}
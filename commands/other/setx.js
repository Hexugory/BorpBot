const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const mMessages = require('../../perms.js').mMessages;

module.exports = class xLimitCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'setx',
			group: 'util',
			memberName: 'setx',
			description: 'Set the amount of :x:s required to delete a message. (Manage Roles)',
			examples: ['\'setx 5'],
			guildOnly: true,

			args: [
				{
					key: 'xl',
					label: 'xl',
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
			return msg.member.hasPermission(mMessages);
		}
	}

	async run(msg, args) {
		this.client.provider.set(msg.guild, 'xLimit' + msg.channel.id, args.xl);
		return msg.channel.sendMessage(`:x: limit set to ${args.xl} in ${msg.channel}.`);
	};
}
const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class GlobalBlacklistCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'gblacklist',
			group: 'util',
			memberName: 'gblacklist',
			description: 'Prevents the specified user from using the bot. (Bot Owner)',
			examples: ['\'gblacklist @Guy Hero#1823'],
			
			args: [
				{
					key: 'user',
					prompt: 'Specify user.',
					type: 'user'
				}
			]
		});
	}

	hasPermission(msg) {
		return this.client.isOwner(msg.author);
	}

	async run(msg, args) {
		if(msg.client.isOwner(args.user)){
			return msg.channel.send('dont blacklist yourself you\'re the bot owner kthnx.');
		}
		else{
			let list = this.client.provider.get('global', 'blacklist', []);
			if(list.includes(args.user.id)){
				list.splice(list.indexOf(args.user.id), 1);
				this.client.provider.set('global', 'blacklist', list);
				return msg.channel.send(`${args.user} has been removed from the blacklist.`);
			}
			else{
				list.push(args.user.id);
				this.client.provider.set('global', 'blacklist', list);
				return msg.channel.send(`${args.user} has been blacklisted.`);
			}
		}
	}
};

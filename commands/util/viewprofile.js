const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class ViewProfileCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'viewprofile',
			group: 'util',
			memberName: 'viewprofile',
			description: oneLine`View a member's profile, if they have one.`,
			examples: ['\'viewprofile @Guy Hero#1823'],

			args: [
				{
					key: 'mb',
					label: 'member',
					prompt: 'Please enter member.',
					type: 'member'
				}
			]
		});
	}

	async run(msg, args) {
		var profiles = this.client.provider.get(msg.guild, 'profiles', {});
		if(!profiles[args.mb.id]){
			return msg.reply(`That member does not have a profile.`);
		}
		else{
			return msg.channel.send(`${args.mb.user.username}'s profile: ${profiles[args.mb.id]}`);
		}
	};
}
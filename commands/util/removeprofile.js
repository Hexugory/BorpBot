const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class RemoveProfileCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'removeprofile',
			group: 'util',
			memberName: 'removeprofile',
			description: oneLine`Remove a member's profile. (Manage Messages)`,
			examples: ['\'removeprofile @Guy Hero#1823'],

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

    hasPermission(msg) {
		return msg.client.isOwner(msg.author) || (msg.member && msg.member.permissions.has('MANAGE_MESSAGES'));
	}

	async run(msg, args) {
        let profiles = this.client.provider.get(msg.guild, 'profiles', {settings: {fields: []}});
        if(!profiles[msg.author.id]){
            msg.reply(`That member does not have a profile.`)
        }
        else{
            delete profiles[msg.author.id]
            this.client.provider.set(msg.guild, 'profiles', profiles);
            msg.reply("Profile removed.");
        }
	};
}
const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class SetFieldsCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'setfields',
			group: 'util',
			memberName: 'setfields',
			description: oneLine`Set profile fields. (Manage Server)`,
            examples: ['\'setfields @Guy Hero#1823'],
            aliases: ['setprofilefields'],

			args: [
				{
					key: 'fd',
					label: 'fields',
					prompt: 'Please enter field. (Infinite)',
					type: 'string',
					infinite: true
				}
			]
		});
	}

    hasPermission(msg) {
		return msg.client.isOwner(msg.author) || (msg.member && msg.member.permissions.has('MANAGE_GUILD'));
	}

	async run(msg, args) {
        let profiles = this.client.provider.get(msg.guild, 'profiles', {settings: {fields: []}});
		profiles.settings.fields = args.fd;
		this.client.provider.set(msg.guild, 'profiles', profiles);
		return msg.reply('Fields set.')
	};
}
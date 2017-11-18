const commando = require('discord.js-commando');
const discord = require('discord.js');
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
		let profiles = this.client.provider.get(msg.guild, 'profiles', {settings: {fields: []}});
		let profileEmbed = new discord.RichEmbed();
		if(typeof profiles[args.mb.id] != 'object'){
			return msg.reply(`That member does not have a profile.`);
		}
		else{
			profileEmbed.setAuthor(`${args.mb.user.username}'s profile`, args.mb.user.avatarURL);
			profileEmbed.setDescription(profiles[args.mb.id].description ? profiles[args.mb.id].description : '<unset>');
			profileEmbed.setColor(profiles[args.mb.id].color ? profiles[args.mb.id].color : [114, 137, 218]);
			profiles[args.mb.id].thumbnail ? profileEmbed.setThumbnail(profiles[args.mb.id].thumbnail) : null;
			for(var i = 0; i < profiles.settings.fields.length; i++){
				profileEmbed.addField(profiles.settings.fields[i], profiles[args.mb.id][profiles.settings.fields[i]] ? profiles[args.mb.id][profiles.settings.fields[i]] : '<unset>', true);
			}
			return msg.channel.send({embed: profileEmbed});
		}
	};
}
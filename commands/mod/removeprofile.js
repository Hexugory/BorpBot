const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class RemoveProfileCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'removeprofile',
			group: 'mod',
			memberName: 'removeprofile',
			description: oneLine`Remove a member's profile.
			Requires mod permission. (See setrole)`,
            examples: ['\'removeprofile @Guy Hero#1823'],
            guildOnly: true,

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
		let roles = msg.member.roles.cache.array();
		let permissions = msg.client.provider.get(msg.guild, 'permissions', {mod:[]});
		if(!permissions.mod){
			return msg.client.isOwner(msg.author);
		}
		else if(permissions.mod.length < 1){
			return msg.client.isOwner(msg.author);
		}
		else{
			for(var i = 0; i < roles.length; i++){
				if(permissions.mod.includes(roles[i].id)){
					return true;
				}
			}
			return msg.client.isOwner(msg.author);
		}
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
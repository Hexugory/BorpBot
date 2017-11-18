const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class SetProfileCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'setprofile',
			group: 'util',
			memberName: 'setprofile',
			description: oneLine`Set a guild specific profile for yourself that can be viewed by anyone.`,
			examples: ['\'setprofile I am the top meme'],

			args: [
				{
					key: 'pf',
					label: 'profile text',
					prompt: 'Please enter profile text.',
					type: 'string'
				}
			]
		});
	}

	async run(msg, args) {
        if(args.pf.length > 1900){
            msg.reply("Your profile cannot be longer than 1900 characters.");
        }
        else{
            var profiles = this.client.provider.get(msg.guild, 'profiles', {});
            profiles[msg.author.id] = args.pf;
            this.client.provider.set(msg.guild, 'profiles', profiles);
            msg.reply("Profile set.");
        }
	};
}
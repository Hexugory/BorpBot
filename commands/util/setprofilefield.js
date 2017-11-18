const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class SetProfileFieldCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'setprofilefield',
			group: 'util',
			memberName: 'setprofilefield',
            description: oneLine`Set a field for a guild specific profile for yourself that can be viewed by anyone.
            Default fields are "thumbnail", "description", and "color".
            To set color supply red green and blue values.`,
			examples: ['\'setprofilefield description I am the top meme', '\'setprofilefield color 255 0 0'],

			args: [
                {
					key: 'fd',
					label: 'field',
					prompt: 'Please enter field.',
					type: 'string'
				},
				{
					key: 'ft',
					label: 'field text',
					prompt: 'Please enter field text.',
					type: 'string'
				}
			]
		});
	}

	async run(msg, args) {
        if(args.ft.length > 1000){
            msg.reply("A field cannot be longer than 1000 characters.");
        }
        else{
            let profiles = this.client.provider.get(msg.guild, 'profiles', {settings: {fields: []}});
            if(typeof profiles[msg.author.id] != 'object'){
                profiles[msg.author.id] = {};
            }
            if(args.fd === 'color'){
                let argSplit = args.ft.split(" ");
                argSplit.length = 3;
                if(Number.isNaN(parseInt(argSplit[0], 10)) || Number.isNaN(parseInt(argSplit[1], 10)) || Number.isNaN(parseInt(argSplit[2], 10))){
                    return msg.reply("That's not a valid color.");
                }
                else{
                    for(var i = 0; i < argSplit.length; i++){
                        argSplit[i] = parseInt(argSplit[i], 10)
                    }
                    profiles[msg.author.id][args.fd] = argSplit;
                    this.client.provider.set(msg.guild, 'profiles', profiles);
                    return msg.reply("Profile field set.");
                }
            }
            else if((Array.isArray(profiles.settings.fields) && profiles.settings.fields.includes(args.fd)) || (args.fd === 'description' || args.fd === 'thumbnail')){
                profiles[msg.author.id][args.fd] = args.ft;
                this.client.provider.set(msg.guild, 'profiles', profiles);
                return msg.reply("Profile field set.");
            }
            else{
                return msg.reply("That field does not exist.");
            }
        }
	};
}
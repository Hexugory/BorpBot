const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class LearnCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'learn',
			group: 'meme',
			memberName: 'learn',
			description: 'Add a factoid to someone.',
			examples: ['\'learn @Guy Hero#7991 is dank'],
			guildOnly: true,
			
			args: [
				{
					key: 'mb',
					label: 'member',
					prompt: 'Specify member.',
					type: 'member'
				},
				{
					key: 'fa',
					label: 'factoid',
					prompt: 'Specify factoid.',
					type: 'string'
				}
			]
		});
	}
	

	async run(msg, args) {
        var factoids = msg.client.provider.get(msg.guild, "factoids", {});
        if(!Array.isArray(factoids[args.mb.id])) factoids[args.mb.id] = [];
        var charcount = args.fa.length;
        for(let str of factoids[args.mb.id]){
            charcount += str.length;
            if(charcount > 1000) return msg.reply("This person has too many factoids or your factoid is too long.");
        }
        factoids[args.mb.id].push(args.fa);
        msg.client.provider.set(msg.guild, "factoids", factoids)
        return msg.reply("I understand.");
	}
};

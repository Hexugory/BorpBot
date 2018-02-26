const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class UnlearnCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'unlearn',
			group: 'meme',
			memberName: 'unlearn',
			description: 'Remove a factoid from someone.',
			examples: ['\'unlearn @Guy Hero#7991 1'],
			guildOnly: true,
			
			args: [
				{
					key: 'mb',
					label: 'member',
					prompt: 'Specify member.',
					type: 'member'
				},
				{
					key: 'id',
					label: 'index',
					prompt: 'Specify factoid index.',
					type: 'integer'
				}
			]
		});
	}
	

	async run(msg, args) {
        var factoids = msg.client.provider.get(msg.guild, "factoids", {});
		if(!Array.isArray(factoids[args.mb.id])||args.id>factoids[args.mb.id].length||args.id<1) return msg.reply("That factoid does not exist.");
		factoids[args.mb.id].splice(args.id-1, 1);
		msg.client.provider.set(msg.guild, "factoids", factoids)
		return msg.reply("Factoid removed.");
	}
};

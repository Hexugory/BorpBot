const { suggestions, sendMessages } = require('../borp.js');

module.exports = {
	name: 'viewsender',
    description: 'Request the sender of a suggestion',
    args: [
        {
            key: 'id',
            type: 'integer'
        }
    ],
	async execute(msg, args) {
        const suggestion = await suggestions.findOne({ where: {
            guild_id: msg.guild.id,
            id: args.id
        } });

        const sender = msg.guild.members.resolve(suggestion.sender_id);
        if (!sender) return msg.reply('that user could not be found')
        sender.send(`The staff of ${msg.guild.name} have viewed your name on one of your suggestions.`);

        return msg.channel.send(sender.toString());
	},
};

const { suggestions } = require('../database.js');

module.exports = {
	name: 'respond',
    description: 'Respond to a suggestion',
    permission: ['MANAGE_MESSAGES'],
    args: [
        {
            key: 'id',
            type: 'integer'
        },
        {
            key: 'message',
            type: 'string'
        }
    ],
	async execute(msg, args) {
        const suggestion = await suggestions.findOne({ where: {
            guild_id: msg.guild.id,
            id: args.id
        } });
        if (!suggestion) return msg.reply('that\'s not a suggestion');

        const sender = msg.guild.members.resolve(suggestion.sender_id) || (await msg.guild.members.fetch(suggestion.sender_id));
        if (!sender) return msg.reply('that user could not be found')
        sender.send(`The staff of ${msg.guild.name} have sent the following response to your suggestion:
"${suggestion.suggestion}"
"${args.message}"${suggestion.anonymous ? '\nYour name has not been viewed.' : ''}`, { split: true });

        return msg.reply('response sent');
	},
};

const { db } = require('../borp.js')
const suggestions = db.import('../models/suggestions');

module.exports = {
	name: 'removesuggestion',
    description: 'Remove a suggestion.',
    permission: ['MANAGE_SERVER'],
    args: [
        {
            key: 'id',
            type: 'integer'
        }
    ],
    guildOnly: true,
	async execute(msg, args) {
        const suggestion = await suggestions.findOne({ where: {
            guild_id: msg.guild.id,
            id: args.id
        } });
        if (!suggestion) return msg.reply('that\'s not a suggestion');

        await suggestion.destroy();

        return msg.reply('removed suggestion');
	},
};

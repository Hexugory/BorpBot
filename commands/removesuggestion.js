const { db } = require('../borp.js')
const suggestions = db.import('../models/suggestions');

module.exports = {
    name: 'removesuggestion',
    aliases: ['removesuggestions'],
    description: 'Remove a suggestion',
    permission: ['MANAGE_GUILD'],
    args: [
        {
            key: 'id',
            type: 'integer',
            infinite: true
        }
    ],
    guildOnly: true,
	async execute(msg, args) {
        let returnStr = '\n';

        for (const id of args.id) {
            const suggestion = await suggestions.findOne({ where: {
                guild_id: msg.guild.id,
                id: id
            } });

            if (suggestion) {
                returnStr += `${id}: removed ✅\n`;
            }
            else {
                returnStr += `${id}: does not exist ❌\n`;
                continue;
            };
    
            await suggestion.destroy();
        }

        return msg.reply(returnStr, { split: true });
	},
};

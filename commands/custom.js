const { db } = require('../borp.js')
const customCommands = db.import('../models/customCommands');

module.exports = {
    name: 'custom',
    aliases: ['listcommands'],
    description: 'List all custom commands.',
    guildOnly: true,
	async execute(msg, args) {
        const guildCommands = await customCommands.findAll({ where: {
            guild_id: msg.guild.id
        } });
        var reply = "";

        for (let command of guildCommands) {
            reply += `\`${command.name}\` `;
        }

        if (reply.length < 1) return msg.reply('this server has no custom commands')

        return msg.channel.send(reply, { split: true });
	},
};

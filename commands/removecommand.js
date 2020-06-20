const { db } = require('../borp.js')
const customCommands = db.import('../models/customCommands');

module.exports = {
	name: 'removecommand',
    description: 'Remove a custom command.',
    permission: ['MANAGE_MESSAGES'],
    args: [
        {
            key: 'name',
            type: 'string',
            validator (arg) {
                return arg.length <= 32;
            }
        }
    ],
    guildOnly: true,
	async execute(msg, args) {
        const command = await customCommands.findOne({ where: {
            guild_id: msg.guild.id,
            name: args.name
        } });

        if (!command) return msg.reply('that\'s not a command');

        command.destroy();

        return msg.reply(`removed \`${args.name}\``);
	},
};

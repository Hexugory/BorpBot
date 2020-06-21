const { db } = require('../borp.js')
const uniqueRoles = db.import('../models/uniqueRoles');

module.exports = {
    name: 'adduniquerole',
    aliases: ['addlocationrole'],
    description: 'Add a unique role.',
    args: [
        {
            key: 'role',
            type: 'role'
        }
    ],
    permission: ['MANAGE_ROLES'],
    guildOnly: true,
	async execute(msg, args) {
        const role = await uniqueRoles.findOne({ where: {
            guild_id: msg.guild.id,
            role_id: args.role.id
        } });
        if (role) return msg.reply('that\'s already a unique role');

        await uniqueRoles.create({
            guild_id: msg.guild.id,
            role_id: args.role.id
        });

        return msg.reply(`added role \`${args.role.name}\``);
	},
};

const { uniqueRoles } = require('../database.js');

module.exports = {
    name: 'adduniquerole',
    aliases: ['addlocationrole'],
    description: 'Add a unique role',
    args: [
        {
            key: 'role',
            type: 'role'
        },
        {
            key: 'description',
            type: 'string',
            optional: true
        },
        {
            key: 'emoji',
            type: 'string',
            optional: true
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
            role_id: args.role.id,
            role_name: args.role.name,
            description: args.description,
            emoji: args.emoji
        });

        return msg.reply(`added role \`${args.role.name}\``);
	},
};

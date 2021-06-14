const { uniqueRoles } = require('../database.js');

module.exports = {
    name: 'removeuniquerole',
    aliases: ['removelocationrole'],
    description: 'Remove a unique role',
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
        if (!role) return msg.reply('that\'s not a unique role');

        await role.destroy();

        return msg.reply(`removed role \`${args.role.name}\``);
	},
};

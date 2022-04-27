const { toggleRoles } = require('../database.js');

module.exports = {
    name: 'removetogglerole',
    description: 'Remove a toggle role',
    args: [
        {
            name: 'role',
            type: 'ROLE',
            description: 'The role to remove',
            required: true
        }
    ],
    guildOnly: true,
	async execute(int) {
        const role = await toggleRoles.findOne({ where: {
            guild_id: int.guild.id,
            role_id: int.options.get('role').role.id
        } });
        if (!role) return int.reply('that\'s not a toggle role');

        await role.destroy();

        return int.reply(`removed role \`${int.options.get('role').role.name}\``);
	},
};

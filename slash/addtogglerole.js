const { toggleRoles } = require('../database.js');

module.exports = {
    name: 'addtogglerole',
    description: 'Add a toggle role',
    args: [
        {
            name: 'role',
            type: 'ROLE',
            description: 'The role to add',
            required: true
        }
    ],
    guildOnly: true,
	async execute(int) {
        const role = await toggleRoles.findOne({ where: {
            guild_id: int.guild.id,
            role_id: int.options.get('role').role.id
        } });
        if (role) return int.reply('that\'s already a toggle role');

        await toggleRoles.create({
            guild_id: int.guild.id,
            role_id: int.options.get('role').role.id,
            role_name: int.options.get('role').role.name
        });

        return int.reply(`added role \`${int.options.get('role').role.name}\``);
	},
};

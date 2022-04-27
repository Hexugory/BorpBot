const { toggleRoles } = require('../database.js');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    name: 'deploytoggle',
    description: 'Sends role-granting messages',
    guildOnly: true,
    async execute(int) {
        const guildRoles = await toggleRoles.findAll({ where: {
            guild_id: int.guild.id
        } });

        var guildToggleRoles = [];

        for (const role of guildRoles) {
            guildToggleRoles.push(new MessageButton()
                .setLabel((role.role_name.length > 25) ? role.role_name.substring(0, 21) + '...' : role.role_name)
                .setCustomId(role.role_id)
                .setStyle('SECONDARY')
            );
        }

        const rows = [];
        for (let i = 0; i < guildToggleRoles.length; i+=5) {
            const row = new MessageActionRow()
                .addComponents(guildToggleRoles.slice(i, i+5));
            rows.push(row);
        }

        for (let i = 0; i < rows.length; i+=5) {
            await int.channel.send({ content: '__​__', components: rows.slice(i, i+5)});
        }

        return int.reply({ content: 'deployed', ephemeral: true })
    },
};
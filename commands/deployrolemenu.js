const { uniqueRoles } = require('../database.js');
const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');

module.exports = {
    name: 'deployrolemenu',
    description: 'Send a message with a dropdown listing all unique roles',
    guildOnly: true,
    permission: ['MANAGE_ROLES'],
    async execute(msg) { 
        const guildRoles = await uniqueRoles.findAll({ where: {
            guild_id: msg.guild.id
        } });

        var guildRoleOptions = [];

        for (const role of guildRoles) {
            guildRoleOptions.push({
                label: (role.role_name.length > 25) ? role.role_name.substring(0, 21) + '...' : role.role_name,
                description: role.description,
                value: role.role_id,
                emoji: role.emoji
            });
        }

        const menu = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('uniqueroleselect')
                    .setPlaceholder('Select a role')
                    .addOptions(guildRoleOptions)
            );

        const button = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('uniqueroleremove')
                    .setLabel('Remove Role')
                    .setStyle('SECONDARY')
            );

        return msg.channel.send({ components: [menu,button]});
    },
};
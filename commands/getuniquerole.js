const { db } = require('../borp.js')
const uniqueRoles = db.import('../models/uniqueRoles');

module.exports = {
    name: 'getuniquerole',
    aliases: ['getlocationrole'],
    description: 'Get a unique role',
    cooldown: 60,
    args: [
        {
            key: 'role',
            type: 'role',
            optional: true
        }
    ],
    guildOnly: true,
	async execute(msg, args) {
        if (!args.role) {
            const guildRoles = await uniqueRoles.findAll({ where: {
                guild_id: msg.guild.id
            } });
            const guildRoleIDs = guildRoles.map(role => role.role_id);

            const newRoles = msg.member.roles.cache
                .filter(role => !guildRoleIDs.includes(role.id))
            msg.member.roles.set(newRoles);
            return msg.reply(`removed role`);
        }

        const role = await uniqueRoles.findOne({ where: {
            guild_id: msg.guild.id,
            role_id: args.role.id
        } });
        if (!role) return msg.reply('you can\'t request that role');
        const guildRoles = await uniqueRoles.findAll({ where: {
            guild_id: msg.guild.id
        } });
        const guildRoleIDs = guildRoles.map(role => role.role_id);
        
        const newRoles = msg.member.roles.cache
            .filter(role => !guildRoleIDs.includes(role.id))
            .set(args.role.id, args.role);
        msg.member.roles.set(newRoles);

        return msg.reply(`given role \`${args.role.name}\``);
	},
};

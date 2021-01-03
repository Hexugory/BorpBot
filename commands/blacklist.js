const { commandBlacklist } = require('../borp.js');

module.exports = {
	name: 'blacklist',
    description: 'Blacklist a member from a command',
    args: [
        {
            key: 'command',
            type: 'string'
        },
        {
            key: 'member',
            type: 'member'
        }
    ],
    guildOnly: true,
	async execute(msg, args) {
        const { commands } = msg.client;
        if (!commands.get(args.command)) {
            msg.reply(`there's no \`${args.command}\` command`);
        }

        const member = (await commandBlacklist.findOrCreate({ where: { user_id: args.member.id, guild_id: msg.guild.id } }))[0];

        const blacklist = JSON.parse(member.blacklist);
        blacklist[args.command] = !blacklist[args.command];

        member.set({
            blacklist: JSON.stringify(blacklist)
        });
        await member.save();

        return msg.reply(`${blacklist[args.command] ? '' : 'un'}blacklisted **${args.member.user.tag}** from \`${args.command}\``);
	},
};

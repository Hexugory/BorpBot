const { blacklistUsers } = require('../borp.js');

module.exports = {
	name: 'gblacklist',
    description: 'banish to the shadow realm',
    args: [
        {
            key: 'user',
            type: 'user'
        }
    ],
    ownerOnly: true,
	async execute(msg, args) {
        const user = (await blacklistUsers.findOrCreate({ where: { user_id: args.user.id } }))[0];

        user.set({
            blacklisted: !user.blacklisted ? 1 : 0
        });
        await user.save();

        return msg.reply(`${user.blacklisted ? '' : 'un'}blacklisted **${args.user.tag}**`);
	},
};

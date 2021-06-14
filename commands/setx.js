const { xConfigs } = require('../database.js');

module.exports = {
	name: 'setx',
    description: 'Set the X config for a channel',
    args: [
        {
            key: 'activityTime',
            type: 'integer',
            validator (arg) {
                return arg <= 3600000;
            }
        },
        {
            key: 'activityRatio',
            type: 'float',
            validator (arg) {
                return arg > 0;
            }
        },
        {
            key: 'minimum',
            type: 'integer',
            validator (arg) {
                return arg >= 1;
            }
        },
        {
            key: 'maximum',
            type: 'integer'
        }
    ],
    guildOnly: true,
    permission: ['MANAGE_CHANNELS'],
	async execute(msg, args) {
        const xConfig = (await xConfigs.findOrCreate({ where: { guild_id: msg.guild.id, channel_id: msg.channel.id } }))[0];

        xConfig.set({
            activityTime: args.activityTime,
            activityRatio: args.activityRatio,
            minimum: args.minimum,
            maximum: args.maximum
        });
        await xConfig.save();

        return msg.reply(`config set`);
	},
};

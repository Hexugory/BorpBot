const { channelTags } = require('../database.js');

module.exports = {
	name: 'setchannel',
    description: 'Set a property of a channel',
    args: [
        {
            key: 'tag',
            type: 'string',
            validator (arg) {
                return ['meme', 'x', 'voice', 'suggest', 'log'].includes(arg);
            }
        }
    ],
    guildOnly: true,
    permission: ['MANAGE_CHANNELS'],
	async execute(msg, args) {
        const channel = (await channelTags.findOrCreate({ where: { guild_id: msg.guild.id, channel_id: msg.channel.id } }))[0];

        channel.set({
            [args.tag]: !channel[args.tag] ? 1 : 0
        });
        await channel.save();

        return msg.reply(`**${msg.channel.name}** ${channel[args.tag] ? 'added to' : 'removed from'} **${args.tag}**`);
	},
};

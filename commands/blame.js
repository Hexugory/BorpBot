module.exports = {
	name: 'blame',
    description: 'Blame someone for your problems.',
    cooldown: 5,
	async execute(msg) {
        var recent = await msg.channel.messages.fetch({limit: 20});
        return msg.reply(`i blame ${recent.random().member.displayName}`);
	},
};

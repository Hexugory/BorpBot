module.exports = {
	name: 'blame',
    description: 'Blame someone for your problems',
	async execute(int) {
        var recent = await int.channel.messages.fetch({limit: 20});
        return int.reply(`i blame ${recent.random().member.displayName}`);
	},
};

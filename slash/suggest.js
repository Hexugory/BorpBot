const { suggestions, channelTags, commandBlacklist } = require('../database.js');

module.exports = {
	name: 'suggest',
    description: 'Suggest something to a server',
    args: [
        {
            name: 'anonymous',
            type: 'BOOLEAN',
            description: 'Would you like your suggestion to be anonymous?',
            required: true
        },
        {
            name: 'suggestion',
            type: 'STRING',
            description: 'The content of your suggestion',
            required: true
        }
    ],
	async execute(int) {
        const member = (await commandBlacklist.findOrCreate({ where: { user_id: int.member.id, guild_id: int.guildId } }))[0];
        if (JSON.parse(member.blacklist)[int.commandName]) {
            return int.reply({ content: 'you\'re not allowed to send suggestions to this server', ephemeral: true });
        }

        const suggestion = await suggestions.create({
            guild_id: int.guildId,
            sender_id: int.member.id,
            anonymous: int.options.get('anonymous').value,
            suggestion: int.options.get('suggestion').value
        });

        const suggestChannels = await channelTags.findAll({ where: {
            guild_id: int.guildId,
            suggest: 1
        } });
        const suggestChannelIDs = suggestChannels.map(channel => channel.channel_id);
        const message = `${int.options.get('anonymous').value ? '[Anonymous]' : int.member.user.tag} suggested: ${int.options.get('suggestion').value}\nSuggestion ID: ${suggestion.id}`;
        int.client.sendMessages(suggestChannelIDs, { split: true, content: message });
        
        return int.reply({ content: 'suggestion sent', ephemeral: true });
	},
};

const { suggestions, channelTags } = require('../database.js');

module.exports = {
	name: 'suggest',
    description: 'Suggest something to a server',
    cooldown: 60,
    usage: '<server> <anonymous (yes/no)> <suggestion>',
    args: [
        {
            key: 'guild',
            type: 'guild'
        },
        {
            key: 'anonymous',
            type: 'string'
        },
        {
            key: 'suggestion',
            type: 'string'
        }
    ],
	async execute(msg, args) {
        switch(args.anonymous) {
            case 'y':
            case 'yes':
            case 'true':
                args.anonymous = true;
                break;

            default:
                args.anonymous = false;
                break;
        };

        const suggestion = await suggestions.create({
            guild_id: args.guild.id,
            sender_id: msg.author.id,
            anonymous: args.anonymous ? 1 : 0,
            suggestion: args.suggestion
        });

        const suggestChannels = await channelTags.findAll({ where: {
            guild_id: args.guild.id,
            suggest: 1
        } });
        const suggestChannelIDs = suggestChannels.map(channel => channel.channel_id);
        const message = `${args.anonymous ? '[Anonymous]' : msg.author.tag} suggested: ${args.suggestion}\nSuggestion ID: ${suggestion.id}`;
        client.sendMessages(suggestChannelIDs, { split: true, content: message });
        
        return msg.reply('suggestion sent');
	},
};

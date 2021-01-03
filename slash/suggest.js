const { SlashCommand, CommandOptionType } = require('slash-create');
const { suggestions, channelTags, sendMessages } = require('../borp.js')

module.exports = class SuggestCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'suggest',
            description: 'Send a suggestion to the server',
            guildID: '163175631562080256',

            options: [
                {
                    type: CommandOptionType.BOOLEAN,
                    name: 'anonymous',
                    description: 'Would you like your suggestion to be anonymous?',
                    required: true
                },
                {
                    type: CommandOptionType.STRING,
                    name: 'suggestion',
                    description: 'The content of your suggestion',
                    required: true
                }
            ]
        });
    }

    async run(ctx) {
        const suggestion = await suggestions.create({
            guild_id: ctx.guildID,
            sender_id: ctx.member.id,
            anonymous: ctx.options.anonymous ? 1 : 0,
            suggestion: ctx.options.suggestion
        });

        const suggestChannels = await channelTags.findAll({ where: {
            guild_id: ctx.guildID,
            suggest: 1
        } })
        const suggestChannelIDs = suggestChannels.map(channel => channel.channel_id);
        const message = `${ctx.options.anonymous ? '[Anonymous]' : `${ctx.member.user.username}#${ctx.member.user.discriminator}`} suggested: ${ctx.options.suggestion}\nSuggestion ID: ${suggestion.id}`;
        sendMessages(suggestChannelIDs, message, { split: true });
        
        return {
            content: 'suggestion sent',
            ephemeral: true
        };
    }
}
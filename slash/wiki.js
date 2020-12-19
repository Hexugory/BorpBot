const { SlashCommand, CommandOptionType } = require('slash-create');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');

module.exports = class WikiCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'wiki',
            description: 'Query the Touhou Wiki',
            guildID: '163175631562080256',

            options: [
                {
                    type: CommandOptionType.STRING,
                    name: 'query',
                    description: 'The page to search',
                    required: true
                }
            ]
        });
    }

    async run(ctx) {
        const search = await axios.get('https://en.touhouwiki.net/api.php', {
            params: {
                action: 'query',
                list: 'search',
                srsearch: ctx.options.query,
                srwhat: 'nearmatch',
                format: 'json'
            }
        });
        
        if (!search.data.query.search[0]) {
            return ctx.send({
                content: 'that page doesn\'t seem to exist',
                ephemeral: true
            });
        }
        
        return ctx.send({
            content: `https://en.touhouwiki.net/wiki/${encodeURIComponent(search.data.query.search[0].title.replace(/ /g, '_'))}`,
            includeSource: true
        });
    }
}
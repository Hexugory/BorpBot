const { SlashCommand, CommandOptionType } = require('slash-create');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');

module.exports = class WikiCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'wiki',
            description: 'Query the Touhou Wiki',

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
        const interlanguage = ['da', 'de', 'en', 'es', 'fr', 'it', 'ko', 'ms', 'nl', 'pl', 'pt', 'ru', 'sv', 'tr', 'uk', 'vi', 'zh'];

        var wiki = 'en'
        const interwiki = ctx.options.query.match(/^\w\w:/)?.[0]?.slice(0, 2)
        if (interlanguage.includes(interwiki)) {
            wiki = interwiki;
            ctx.options.query = ctx.options.query.slice(2);
        }

        const search = await axios.get(`https://${wiki}.touhouwiki.net/api.php`, {
            params: {
                action: 'query',
                list: 'search',
                srsearch: ctx.options.query,
                srwhat: 'nearmatch',
                format: 'json'
            }
        });

        if (!search.data.query.search[0]) {
            return {
                content: 'that page doesn\'t seem to exist',
                ephemeral: true
            }
        }

        const extract = await axios.get(`https://${wiki}.touhouwiki.net/api.php`, {
            params: {
                action: 'query',
                prop: 'extracts',
                exlimit: 1,
                explaintext: 1,
                exintro: 1,
                exchars: 500,
                redirects: 1,
                format: 'json',
                titles: search.data.query.search[0].title
            }
        });
        
        const page = extract.data.query.pages[Object.keys(extract.data.query.pages)[0]];

        return {
            embeds: [
                new MessageEmbed({
                    title: page.title,
                    url: encodeURI(`https://${wiki}.touhouwiki.net/wiki/${page.title}`),
                    description: page.extract.slice(0, -3),
                    footer: {
                        iconURL: `https://en.touhouwiki.net/favicon.ico`,
                        text: `Touhou Wiki`
                    }
                })
            ],
            includeSource: true
        };
    }
}
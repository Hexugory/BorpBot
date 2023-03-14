import { ApplicationCommandOptionData, ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from "discord.js"
import { createArgumentsObject, SlashCommand } from "./slash"
import axios from "axios"

interface WikiArguments {
    query: string
}

export class WikiCommand implements SlashCommand {
	name = 'wiki'
    description = 'Query the Touhou Wiki'
    permission = []
    ownerOnly = false
    guildOnly = false
    args: ApplicationCommandOptionData[] = [
        {
            name: 'query',
            type: ApplicationCommandOptionType.String,
            description: 'The page to search',
            required: true
        }
    ]

	async execute(int: CommandInteraction) {
        const args = createArgumentsObject(int.options.data) as WikiArguments;

        const interlanguage = ['da', 'de', 'en', 'es', 'fr', 'it', 'ko', 'ms', 'nl', 'pl', 'pt', 'ru', 'sv', 'tr', 'uk', 'vi', 'zh'];

        var wiki = 'en';
        const interwiki = args.query.match(/^\w\w:/)?.[0]?.slice(0, 2);
        if (interwiki && interlanguage.includes(interwiki)) {
            wiki = interwiki;
            args.query = args.query.slice(2);
        }

        const search = await axios.get(`https://${wiki}.touhouwiki.net/api.php`, {
            params: {
                action: 'query',
                list: 'search',
                srsearch: args.query,
                srwhat: 'nearmatch',
                format: 'json'
            }
        });

        if (!search.data.query.search[0]) {
            return int.reply({
                content: 'that page doesn\'t seem to exist',
                ephemeral: true
            })
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

        return int.reply({
            embeds: [
                new EmbedBuilder({
                    title: page.title,
                    url: encodeURI(`https://${wiki}.touhouwiki.net/wiki/${page.title}`),
                    description: page.extract.slice(0, -3),
                    footer: {
                        iconURL: `https://en.touhouwiki.net/favicon.ico`,
                        text: `Touhou Wiki`
                    }
                })
            ]
        });
	}
};
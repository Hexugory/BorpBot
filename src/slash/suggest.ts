import { ApplicationCommandOptionData, ApplicationCommandOptionType, CommandInteraction, GuildMember } from "discord.js"
import { createArgumentsObject, SlashCommand } from "./slash"
import { CommandBlacklist } from "../models/commandblacklist"
import { Suggestions } from "../models/suggestions"
import { ChannelTags } from "../models/channeltags"
import { BorpClient } from "../borpclient"

interface SuggestArguments {
    anonymous: boolean
    suggestion: string
}

export class SuggestCommand implements SlashCommand {
	name = 'suggest'
    description = 'Suggest something to a server'
    permission = []
    ownerOnly = false
    guildOnly = true
    args: ApplicationCommandOptionData[] = [
        {
            name: 'anonymous',
            type: ApplicationCommandOptionType.Boolean,
            description: 'Would you like your suggestion to be anonymous?',
            required: true
        },
        {
            name: 'suggestion',
            type: ApplicationCommandOptionType.String,
            description: 'The content of your suggestion',
            required: true
        }
    ]

	async execute(int: CommandInteraction) {
        const args = createArgumentsObject(int.options.data) as SuggestArguments;

        const member = (await CommandBlacklist.findOrCreate({ where: { user_id: (int.member as GuildMember).id, guild_id: int.guildId! } }))[0];
        if (JSON.parse(member.blacklist)[int.commandName]) {
            return int.reply({ content: 'you\'re not allowed to send suggestions to this server', ephemeral: true });
        }

        const suggestion = await Suggestions.create({
            guild_id: int.guildId!,
            user_id: (int.member as GuildMember).id,
            anonymous: args.anonymous,
            suggestion: args.suggestion
        });

        const suggestChannels = await ChannelTags.findAll({ where: {
            guild_id: int.guildId!,
            suggest: 1
        } });
        const suggestChannelIDs = suggestChannels.map(channel => channel.channel_id);
        const message = `${args.anonymous ? '[Anonymous]' : (int.member as GuildMember).user.tag} suggested: ${args.suggestion}\nSuggestion ID: ${suggestion.id}`;
        (int.client as BorpClient).sendMessages(suggestChannelIDs, { content: message });
        
        return int.reply({ content: 'suggestion sent', ephemeral: true });
	}
};

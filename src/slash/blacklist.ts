import { ApplicationCommandOptionData, ApplicationCommandOptionType, CommandInteraction, GuildMember, Message, PermissionFlagsBits } from "discord.js"
import { CommandClient } from "../commandclient"
import { CommandBlacklist } from "../models/commandblacklist"
import { createArgumentsObject, SlashCommand } from "./slash"

interface BlacklistCommandArguments {
    member: GuildMember
    command: string
}

export class BlacklistCommand implements SlashCommand {
	name = 'blacklist'
    description = 'Blacklist a member from a command'
    permission = [PermissionFlagsBits.ManageMessages]
    guildOnly = true
    ownerOnly = false
    args: ApplicationCommandOptionData[] = [
        {
            name: 'member',
            type: ApplicationCommandOptionType.User,
            description: "The user to blacklist",
            required: true
        },
        {
            name: 'command',
            type: ApplicationCommandOptionType.String,
            description: "The command to blacklist them from",
            required: true
        }
    ]

	async execute(int: CommandInteraction) {
        const args = createArgumentsObject(int.options.data) as BlacklistCommandArguments;

        const { commands } = int.client as CommandClient;
        if (!commands.get(args.command)) {
            return int.reply(`there's no \`${args.command}\` command`);
        }

        const member = (await CommandBlacklist.findOrCreate({ where: { user_id: args.member.id, guild_id: int.guild!.id } }))[0];

        const blacklist = JSON.parse(member.blacklist);
        blacklist[args.command] = !blacklist[args.command];

        member.set({
            blacklist: JSON.stringify(blacklist)
        });
        await member.save();

        return int.reply(`${blacklist[args.command] ? '' : 'un'}blacklisted **${args.member.user.tag}** from \`${args.command}\``);
	}
};

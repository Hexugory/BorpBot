import { GuildMember, Message, PermissionFlagsBits } from "discord.js"
import { CommandClient } from "../commandclient"
import { CommandBlacklist } from "../models/commandblacklist"
import { MemberArgument } from "../types/member"
import { StringArgument } from "../types/string"
import { Command } from "./command"

interface BlacklistCommandArguments {
    member: GuildMember
    command: string
}

export class BlacklistCommand implements Command {
	name = 'blacklist'
    aliases = []
    description = 'Blacklist a member from a command'
    usage = 'blacklist <command> <member>'
    permission = [PermissionFlagsBits.ManageMessages]
    guildOnly = true
    ownerOnly = false
    args = [
        {
            key: 'member',
            type: MemberArgument,
            infinite: false,
            optional: false
        },
        {
            key: 'command',
            type: StringArgument,
            infinite: false,
            optional: false
        }
    ]
	async execute(msg: Message, arglist: {}) {
        const args = arglist as BlacklistCommandArguments;
        const { commands } = msg.client as CommandClient;
        if (!commands.get(args.command)) {
            return msg.reply(`there's no \`${args.command}\` command`);
        }

        const member = (await CommandBlacklist.findOrCreate({ where: { user_id: args.member.id, guild_id: msg.guild!.id } }))[0];

        const blacklist = JSON.parse(member.blacklist);
        blacklist[args.command] = !blacklist[args.command];

        member.set({
            blacklist: JSON.stringify(blacklist)
        });
        await member.save();

        return msg.reply(`${blacklist[args.command] ? '' : 'un'}blacklisted **${args.member.user.tag}** from \`${args.command}\``);
	}
};

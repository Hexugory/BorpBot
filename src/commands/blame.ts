import { Message, PermissionResolvable } from "discord.js";
import { Command } from "./command";

export class BlameCommand implements Command {
	name = 'blame'
    aliases = []
    description = 'Blame someone for your problems'
    usage = 'blame'
    permission = []
    guildOnly = false
    ownerOnly = false
    args = []

	async execute(msg: Message) {
        const recent = await msg.channel.messages.fetch({limit: 20});
        const suspect = recent.random();
        if (!suspect) return msg.reply("i can't see");
        return msg.reply(`i blame ${suspect.member ? suspect.member.displayName : suspect.author.username}`);
	}
};

import { Message, User } from "discord.js"
import { Command } from "./command"
import { UserArgument } from "../types/user"
import { BlacklistUsers } from "../models/blacklistusers"

interface GlobalBlacklistArguments {
    users: User[]
}

export class GlobalBlacklistCommand implements Command {
	name = 'gblacklist'
    aliases = []
    description = 'banish to the shadow realm'
    usage = 'no'
    permission = []
    guildOnly = false
    ownerOnly = true
    args = [
        {
            key: 'users',
            type: UserArgument,
            infinite: true,
            optional: false
        }
    ]

	async execute(msg: Message, arglist: {}) {
        const args = arglist as GlobalBlacklistArguments;
        let replystr = '';

        for (const user of args.users){
            const row = (await BlacklistUsers.findOne({ where: { user_id: user.id } }));

            if (row) {
                row.destroy()
                replystr += `${user.tag}: removed\n`
            }
            else {
                await BlacklistUsers.create({ user_id: user.id });
                replystr += `${user.tag}: added\n`
            }
        }

        msg.reply(replystr);
	}
};

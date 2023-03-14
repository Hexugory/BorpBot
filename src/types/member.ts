import { Message } from "discord.js";
import { Argument } from "./arg";

class MemberArgumentClass implements Argument {
    name = 'user'

    validate (arg: string, msg: Message) {
        var idMatch = arg.match(/<@!?(\d+)>/);

        if (!idMatch) {
            return msg.guild!.members.cache.filter(member => {return member.user.username.toLowerCase().startsWith(arg.toLowerCase())}).size === 1;
        }

        var id = idMatch[1];
        if (!msg.client.users.resolve(id)) return false;

        return true;
    }

    parse (arg: string, msg: Message) {
        var idMatch = arg.match(/<@!?(\d+)>/);

        if (!idMatch) {
            return msg.guild!.members.cache.find(member => {return member.user.username.toLowerCase().startsWith(arg.toLowerCase())});
        }

        var id = idMatch[1];
        return msg.guild!.members.resolve(id);
    }
}

export const MemberArgument = new MemberArgumentClass();
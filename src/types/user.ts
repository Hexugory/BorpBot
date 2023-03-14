import { Message } from "discord.js";
import { Argument } from "./arg";

class UserArgumentClass implements Argument {
    name = 'user'

    validate (arg: any, msg: Message) {
        var id = arg.match(/<@!?(\d+)>/);
        if (id) id = id[1];

        if (!id) {
            return msg.client.users.cache.filter(user => {return user.username.toLowerCase().startsWith(arg.toLowerCase())}).size === 1;
        }

        if (!msg.client.users.resolve(id)) return false;

        return true;
    }

    parse (arg: any, msg: Message) {
        var id = arg.match(/<@!?(\d+)>/);
        if (id) id = id[1];

        if (!id) {
            return msg.client.users.cache.find(user => {return user.username.toLowerCase().startsWith(arg.toLowerCase())});
        }

        return msg.client.users.resolve(id);
    }
}

export const UserArgument = new UserArgumentClass();
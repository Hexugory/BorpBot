import { Message } from "discord.js"
import { Command } from "./command"
import { StringArgument } from "../types/string"

interface RandomCaseArguments {
    string: string
}

export class RandomCaseCommand implements Command {
	name = 'randomcase'
    aliases = []
    description = 'dOEs thIs'
    usage = 'some words'
    permission = []
    guildOnly = false
    ownerOnly = false
    args = [
        {
            key: 'string',
            type: StringArgument,
            infinite: false,
            optional: false
        }
    ]

	async execute(msg: Message, arglist: {}) {
        const args = (arglist as RandomCaseArguments);
        var strSplit = args.string.toLowerCase().split('');
        for(let [i, char] of strSplit.entries()){
            if (Math.random() > 0.5) strSplit[i] = char.toUpperCase();
        }
        msg.channel.send(strSplit.join(''));
        return;
	}
};

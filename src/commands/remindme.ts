import { Message } from "discord.js"
import { Command } from "./command"
import { StringArgument } from "../types/string"
import { Duration, HumanTimeArgument } from "../types/duration"
import { Reminders } from "../models/reminders"

interface RemindMeArguments {
    time: Duration[]
    string: string
}

export class RemindMeCommand implements Command {
	name = 'remindme'
    aliases = []
    description = 'Sets a reminder'
    usage = 'remindme <time> <string>'
    permission = []
    guildOnly = false
    ownerOnly = false
    args = [
        {
            key: 'time',
            type: HumanTimeArgument,
            infinite: false,
            optional: false
        },
        {
            key: 'string',
            type: StringArgument,
            infinite: false,
            optional: false
        }
    ]

    static addToDate(date: Date, period: string, amount: number) {
        console.log(date, period, amount);
        switch (period) {
            case "minute":
                return date.setTime(date.getTime()+(1000*60*amount));
            case "hour":
                return date.setTime(date.getTime()+(1000*60*60*amount));
            case "day":
                return date.setTime(date.getTime()+(1000*60*60*24*amount));
            case "week":
                return date.setTime(date.getTime()+(1000*60*60*24*7*amount));
            case "month":
                return date.setUTCMonth(date.getUTCMonth()+amount);
            case "year":
                return date.setUTCFullYear(date.getUTCFullYear()+amount);
        }
    }

	async execute(msg: Message, arglist: {}) {
        const args = (arglist as RemindMeArguments);

        const endTime = new Date();
        for (const duration of args.time) {
            RemindMeCommand.addToDate(endTime, duration.period, duration.amount);
        }

        await Reminders.create({
            user_id: msg.author.id,
            time: endTime,
            reminder: args.string
        });

        return msg.reply(`set a reminder for <t:${Math.floor(endTime.getTime()/1000)}>`);
	}
};

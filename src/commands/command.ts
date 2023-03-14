import { Message, PermissionResolvable } from "discord.js"
import { Argument } from "../types/arg"

export interface Command {
    name: string
    aliases: string[]
    description: string
    cooldown?: number
    usage: string
    permission: PermissionResolvable[]
    guildOnly: boolean
    ownerOnly: boolean
    args: {
        key: string
        type: Argument
        validator?(arg: string | any[], msg: Message): boolean
        infinite: boolean
        optional: boolean
    }[]
    execute(msg: Message, arglist: {}): Promise<any>
}
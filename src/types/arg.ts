import { Message } from "discord.js"

export interface Argument {
    name: string
    validate (arg: string, msg: Message): boolean
    parse (arg: string, msg: Message): any
}
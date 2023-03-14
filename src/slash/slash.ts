import { ApplicationCommandOptionData, AutocompleteInteraction, CommandInteraction, PermissionResolvable, CommandInteractionOption, CacheType } from "discord.js"

export interface SlashCommand {
    name: string
    description: string
    cooldown?: number
    permission: PermissionResolvable[]
    guildID?: string
    ownerOnly: boolean
    guildOnly: boolean
    args: ApplicationCommandOptionData[]
    autocomplete?(int: AutocompleteInteraction): Promise<void>
    execute(int: CommandInteraction): Promise<any>
}

export function createArgumentsObject(data: readonly CommandInteractionOption<CacheType>[]) {
    var a: {
        [key: string]: any
    } = {};
    for (const arg of data) {
        a[arg.name] = arg.value;
    }
    return a;
}
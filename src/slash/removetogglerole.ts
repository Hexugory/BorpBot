import { ApplicationCommandOptionData, ApplicationCommandOptionType, CommandInteraction, Role } from "discord.js"
import { createArgumentsObject, SlashCommand } from "./slash"
import { ToggleRoles } from "../models/toggleroles"

interface RemoveToggleRoleArguments {
    role: Role
}

export class RemoveToggleRoleCommand implements SlashCommand {
	name = 'removetogglerole'
    description = 'Remove a toggle role'
    permission = []
    ownerOnly = false
    guildOnly = true
    args: ApplicationCommandOptionData[] = [
        {
            name: 'role',
            type: ApplicationCommandOptionType.Role,
            description: 'The role to remove',
            required: true
        }
    ]

	async execute(int: CommandInteraction) {
        const args = createArgumentsObject(int.options.data) as RemoveToggleRoleArguments;

        const role = await ToggleRoles.findOne({ where: {
            guild_id: int.guild!.id,
            role_id: args.role.id
        } });
        if (!role) return int.reply('that\'s not a toggle role');

        await role.destroy();

        return int.reply(`removed role \`${args.role.name}\``);
	}
};

import { ApplicationCommandOptionData, ApplicationCommandOptionType, CommandInteraction, PermissionFlagsBits, Role } from "discord.js"
import { createArgumentsObject, SlashCommand } from "./slash"
import { ToggleRoles } from "../models/toggleroles"

interface AddToggleRoleArguments {
    role: Role
}

export class AddToggleRoleCommand implements SlashCommand {
	name = 'addtogglerole'
    description = 'Add a toggle role'
    permission = [PermissionFlagsBits.ManageRoles]
    ownerOnly = false
    guildOnly = true
    args: ApplicationCommandOptionData[] = [
        {
            name: 'role',
            type: ApplicationCommandOptionType.Role,
            description: 'The role to add',
            required: true
        }
    ]

	async execute(int: CommandInteraction) {
        const args = createArgumentsObject(int.options.data) as AddToggleRoleArguments;

        const role = await ToggleRoles.findOne({ where: {
            role_id: args.role.id
        } });
        if (role) return int.reply('that\'s already a toggle role');

        await ToggleRoles.create({
            guild_id: int.guild!.id,
            role_id: args.role.id,
            role_name: args.role.name
        });

        return int.reply(`added role \`${args.role.name}\``);
	}
};

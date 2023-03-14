import { ApplicationCommandOptionData, ApplicationCommandOptionType, CommandInteraction, PermissionFlagsBits, Role } from "discord.js"
import { createArgumentsObject, SlashCommand } from "./slash"
import { UniqueRoles } from "../models/uniqueroles"

interface AddUniqueRoleArguments {
    role: Role
    description?: string
    emoji?: string
}

export class AddUniqueRoleCommand implements SlashCommand {
	name = 'adduniquerole'
    description = 'Add a unique role'
    permission = [PermissionFlagsBits.ManageRoles]
    ownerOnly = false
    guildOnly = true
    args: ApplicationCommandOptionData[] = [
        {
            name: 'role',
            type: ApplicationCommandOptionType.Role,
            description: 'The role to add',
            required: true
        },
        {
            name: 'description',
            type: ApplicationCommandOptionType.String,
            description: 'String to put in the description section',
            required: false
        },
        {
            name: 'emoji',
            type: ApplicationCommandOptionType.String,
            description: 'Emoji to put in the emoji section',
            required: false
        }
    ]

	async execute(int: CommandInteraction) {
        const args = createArgumentsObject(int.options.data) as AddUniqueRoleArguments;

        const role = await UniqueRoles.findOne({ where: {
            role_id: args.role.id
        } });
        if (role) return int.reply('that\'s already a unique role');

        await UniqueRoles.create({
            guild_id: int.guild!.id,
            role_id: args.role.id,
            role_name: args.role.name,
            description: args.description,
            emoji: args.emoji
        });

        return int.reply(`added role \`${args.role.name}\``);
	}
};
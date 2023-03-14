import { ApplicationCommandOptionData, CommandInteraction, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits, SelectMenuBuilder } from "discord.js"
import { UniqueRoles } from "../models/uniqueroles"
import { SlashCommand } from "./slash"

export class DeployUniqueCommand implements SlashCommand {
	name = 'deployunique'
    description = 'Sends unique role granting menu'
    permission = [PermissionFlagsBits.ManageRoles]
    ownerOnly = false
    guildOnly = true
    args: ApplicationCommandOptionData[] = []

	async execute(int: CommandInteraction) {
        const guildRoles = await UniqueRoles.findAll({ where: {
            guild_id: int.guild!.id
        } });

        var guildRoleOptions = [];

        for (const role of guildRoles) {
            guildRoleOptions.push({
                label: (role.role_name.length > 25) ? role.role_name.substring(0, 21) + '...' : role.role_name,
                description: role.description,
                value: role.role_id,
                emoji: role.emoji
            });
        }

        const menu = new ActionRowBuilder<SelectMenuBuilder>()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('uniqueroleselect')
                    .setPlaceholder('Select a role')
                    .addOptions(guildRoleOptions)
            );

        const button = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('uniqueroleremove')
                    .setLabel('Remove Role')
                    .setStyle(ButtonStyle.Secondary)
            );

        return int.channel!.send({ content: 'select a role', components: [menu,button]});
	}
};
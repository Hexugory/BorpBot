import { ApplicationCommandOptionData, CommandInteraction, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } from "discord.js"
import { ToggleRoles } from "../models/toggleroles"
import { SlashCommand } from "./slash"

export class DeployToggleCommand implements SlashCommand {
	name = 'deploytoggle'
    description = 'Sends role-granting messages'
    permission = [PermissionFlagsBits.ManageRoles]
    ownerOnly = false
    guildOnly = true
    args: ApplicationCommandOptionData[] = []

	async execute(int: CommandInteraction) {
        const guildRoles = await ToggleRoles.findAll({ where: {
            guild_id: int.guild!.id
        } });

        var guildToggleRoles = [];

        for (const role of guildRoles) {
            if (!int.guild!.roles.resolve(role.role_id)) {
                role.destroy();
                return int.reply({ content: 'failed due to deleted role', ephemeral: true });
            }
            guildToggleRoles.push(new ButtonBuilder()
                .setLabel((role.role_name.length > 25) ? role.role_name.substring(0, 21) + '...' : role.role_name)
                .setCustomId(role.role_id)
                .setStyle(ButtonStyle.Secondary)
            );
        }

        const rows = [];
        for (let i = 0; i < guildToggleRoles.length; i+=5) {
            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(guildToggleRoles.slice(i, i+5));
            rows.push(row);
        }

        for (let i = 0; i < rows.length; i+=5) {
            await int.channel!.send({ content: '__​__', components: rows.slice(i, i+5)});
        }

        return int.reply({ content: 'deployed', ephemeral: true });
	}
};
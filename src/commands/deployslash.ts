import { Message } from "discord.js"
import { CommandClient } from "../commandclient"
import { Command } from "./command"

export class DeploySlashCommand implements Command{
	name = 'deployslash'
    aliases = []
    description = 'Deploys slash commands'
    usage = ''
    permission = []
    guildOnly = false
    ownerOnly = true
    args = []

	async execute(msg: Message) {
        const client = msg.client as CommandClient;

        client.slashCommands.forEach(async (command) => {
            console.log(command);
            if (command.guildID) {
                const data = {
                    name: command.name,
                    description: command.description,
                    options: command.args
                }
                console.log(await client.application!.commands.create(data, command.guildID));
            }
            else {
                const data = {
                    name: command.name,
                    description: command.description,
                    options: command.args
                }
                console.log(await client.application!.commands.create(data));
            }
        });
	}
};

import { ApplicationCommandOptionData, ApplicationCommandOptionType, CommandInteraction } from "discord.js"
import { createArgumentsObject, SlashCommand } from "./slash"

interface RandomCaseArguments {
    string: string
}

export class RandomCaseCommand implements SlashCommand {
	name = 'randomcase'
    description = 'dOEs thIs'
    permission = []
    ownerOnly = false
    guildOnly = false
    args: ApplicationCommandOptionData[] = [
        {
            name: 'string',
            type: ApplicationCommandOptionType.String,
            description: 'some words',
            required: true
        }
    ]

	async execute(int: CommandInteraction) {
        const args = createArgumentsObject(int.options.data) as RandomCaseArguments;

        var strSplit = args.string.toLowerCase().split('');
        for(let [i, char] of strSplit.entries()){
            if (Math.random() > 0.5) strSplit[i] = char.toUpperCase();
        }
        int.reply(strSplit.join(''));
        return;
	}
};

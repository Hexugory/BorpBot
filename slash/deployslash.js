module.exports = {
	name: 'deployslash',
    description: 'deploy slash commands',
    ownerOnly: true,

	async execute(int) {
        int.reply('ok')
        for (const command of [...int.client.slashCommands.values()]){
            console.log(command);
            if (command.guildID) {
                const data = {
                    name: command.name,
                    description: command.description
                }
                data.options = command?.args;
                await int.client.application.commands.create(data, command.guildID).catch(err => console.error(err));
            }
            else {
                const data = {
                    name: command.name,
                    description: command.description
                }
                data.options = command?.args;
                await int.client.application.commands.create(data).catch(err => console.error(err));
            }
        };
	},
};

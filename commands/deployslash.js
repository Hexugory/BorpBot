module.exports = {
	name: 'deployslash',
    description: 'deploy slash commands',
    ownerOnly: true,

	async execute(msg) {
        for (const command of [...msg.client.slashCommands.values()]){
            console.log(command);
            if (command.guildID) {
                const data = {
                    name: command.name,
                    description: command.description
                }
                data.options = command?.args;
                await msg.client.application.commands.create(data, command.guildID).catch(err => console.error(err));
            }
            else {
                const data = {
                    name: command.name,
                    description: command.description
                }
                data.options = command?.args;
                await msg.client.application.commands.create(data).catch(err => console.error(err));
            }
        };
	},
};

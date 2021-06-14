module.exports = {
	name: 'deployslash',
    description: 'deploy slash commands',
    ownerOnly: true,

	async execute(msg) {
        for (const command of msg.client.slashCommands.array()){
            console.log(command);
            if (command.guildID) {
                const data = {
                    name: command.name,
                    description: command.description
                }
                data.options = command?.args;
                await msg.client.application.commands.create(data, command.guildID);
            }
            else {
                const data = {
                    name: command.name,
                    description: command.description
                }
                data.options = command?.args;
                await msg.client.application.commands.create(data);
            }
        };
	},
};

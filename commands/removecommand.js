const { customCommands } = require('../database.js');

module.exports = {
    name: 'removecommand',
    aliases: ['removecommands'],
    description: 'Remove a custom command',
    permission: ['MANAGE_MESSAGES'],
    args: [
        {
            key: 'name',
            type: 'string',
            infinite: true,
            validator (arg) {
                return arg.every(value => {
                    return value.length <= 32 && !value.includes(' ');
                });
            }
        }
    ],
    guildOnly: true,
	async execute(msg, args) {
        let returnStr = '\n';

        for (const name of args.name) {
            const command = await customCommands.findOne({ where: {
                guild_id: msg.guild.id,
                name: name
            } });

            if (command) {
                returnStr += `${name}: removed ✅\n`;
            }
            else {
                returnStr += `${name}: does not exist ❌\n`;
                continue;
            };
    
            await command.destroy();
        }

        return msg.reply(returnStr, { split: true });
	},
};

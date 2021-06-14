const { customCommands } = require('../database.js');

module.exports = {
	name: 'newcommand',
    description: 'Create a new custom command',
    args: [
        {
            key: 'name',
            type: 'string',
            validator (arg) {
                return arg.length <= 32 && !arg.includes(' ');
            }
        },
        {
            key: 'response',
            type: 'string'
        }
    ],
    guildOnly: true,
	async execute(msg, args) {
        const guildCommands = await customCommands.findAll({ where: {
            guild_id: msg.guild.id
        } });

        if (guildCommands.find(command => {return command.name === args.name})) return msg.reply('you can\'t have two commands with the same name');
        if (msg.client.commands.get(args.name)
        || msg.client.commands.find(c => c.aliases && c.aliases.includes(args.name))) return msg.reply('you tried, but you can\'t name a custom command after a bot command');

        await customCommands.create({
            guild_id: msg.guild.id,
            name: args.name,
            response: args.response
        });

        return msg.reply(`created command \`${args.name}\``);
	},
};

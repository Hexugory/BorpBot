const { prefix } = require('../config.json');

module.exports = {
	name: 'help',
	description: 'Lists all commands or info about a specific command',
	aliases: ['commands'],
    usage: '[command name]',
    args: [
        {
            key: 'command',
            type: 'string',
            optional: true
        }
    ],
	cooldown: 5,
	execute(msg, args) {
		const data = [];
		const { commands } = msg.client;

		if (!args.command) {
			data.push('here\'s a list of commands:');
			data.push(commands.map(command => command.name).join(', '));
			data.push(`\nyou can send \`${prefix}help [command name]\` to get info on a specific command`);

			return msg.author.send(data, { split: true })
				.then(() => {
					if (msg.channel.type === 'dm') return;
					msg.reply('i\'ve sent you a DM with a list of commands');
				})
				.catch(error => {
					console.error(`Could not send help DM to ${msg.author.tag}.\n`, error);
					msg.reply('your DMs are closed, i can\'t send the list of commands');
				});
		}

		const name = args.command.toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			return msg.reply('that\'s not a command');
		}

		data.push(`**Name:** ${command.name}`);

		if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
		if (command.description) data.push(`**Description:** ${command.description}`);
		if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

		data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

		msg.channel.send(data, { split: true });
	},
};

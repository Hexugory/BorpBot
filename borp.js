const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const moment = require('moment');
const { prefix, token, owner, pubkey, clientid } = require('./config.json');
const CommandHandler = require('./commandHandler.js');
const { 
	customCommands,
	channelTags,
	xConfigs,
	blacklistUsers,
	commandBlacklist,
	suggestions,
	uniqueRoles,
	reminders } = require('./database.js');

const intents = new Discord.Intents();
intents.add(Discord.Intents.FLAGS.GUILDS)
	.add(Discord.Intents.FLAGS.GUILD_VOICE_STATES)
	.add(Discord.Intents.FLAGS.GUILD_MESSAGES)
	.add(Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS)
	.add(Discord.Intents.FLAGS.DIRECT_MESSAGES);
const client = new Discord.Client({ intents: intents, partials: ['CHANNEL', 'REACTION'] });


client.commands = new Discord.Collection();
client.slashCommands = new Discord.Collection();
client.commandHandler = new CommandHandler();
client.db = require('./database.js').db;
client.sendMessages = (arr, content, options = {}) => {
	for (let channel of arr) {
		try {
			client.channels.resolve(channel).send(content, options).catch(err => console.error(err));
		}
		catch (error) {console.error(error)}
	}
}

async function xCalculation (msg) {
	const xChannel = await channelTags.findOne({ where: {
		guild_id: msg.guild.id,
		channel_id: msg.channel.id,
		x: 1
	} });
	if (!xChannel) return;

	const xConfig = await xConfigs.findOne({ where: {
		guild_id: msg.guild.id,
		channel_id: msg.channel.id
	} });
	if (!xConfig) return;

	const now = Date.now();

	if (!msg.channel.xRecentMessages) msg.channel.xRecentMessages = [];
	msg.channel.xRecentMessages.push(msg);
	msg.channel.xRecentMessages = msg.channel.xRecentMessages.filter(msg => msg.createdTimestamp > now-xConfig.activityTime);

	const uniqueIDs = [];
	for (const recentMsg of msg.channel.xRecentMessages) {
		if (!recentMsg.author.bot
			 && !uniqueIDs.includes(recentMsg.author.id)) uniqueIDs.push(recentMsg.author.id);
	}

	msg.requiredX = Math.max(Math.min(Math.ceil(xConfig.activityRatio * uniqueIDs.length), xConfig.maximum), xConfig.minimum);
}

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const slashCommandFiles = fs.readdirSync('./slash').filter(file => file.endsWith('.js'));

for (const file of slashCommandFiles) {
	const command = require(`./slash/${file}`);
	client.slashCommands.set(command.name, command);
}

client.cooldowns = new Discord.Collection();

client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}`);

	setInterval(async () => {
		const allReminders = await reminders.findAll();
		for (const reminder of allReminders) {
			if (moment.utc().isBefore(reminder.time)) continue;

			const sender = client.users.resolve(reminder.sender_id);
			if (sender) {
				sender.send(`you asked to be reminded of: ${reminder.reminder}`);
			}

			await reminder.destroy();
		}
	}, 60000)
});

client.on('messageCreate', async (msg) => {
	if (msg.content.toLowerCase().includes("press 🇫 to pay respects")
	   || msg.content.toLowerCase().includes("press f to pay respects")){
		msg.react('\u{1f1eb}');
	};

	if (msg.channel.id === '637483955666550833') {
		await msg.react('\u{1F44D}');
		await msg.react('\u{1F44E}');
	}

	if (msg.guild) xCalculation(msg);

	if (!msg.content.startsWith(prefix) || msg.author.bot) return;

	if (msg.author.id != owner && (await blacklistUsers.findOne({ where: { user_id: msg.author.id, blacklisted: 1 } }))) return;

	const command = await client.commandHandler.parseCommand(msg);
});

client.on('interactionCreate', async (int) => {
	if (int.isCommand()) {
		const command = client.slashCommands.get(int.commandName);

		if (command.permission && int.user.id != owner) {
			for (const permission of command.permission) {
				if (!int.member.permissionsIn(int.channel).has(permission)) return int.reply({ content: 'you aren\'t allowed to use that command', ephemeral: true });
			}
		}

		command.execute(int).catch(error => {
			int.reply({ content: 'there was an error\nping guy 19 times', ephemeral: true });
			return console.error(error);
		});
		console.info(`${int.user.tag} (${int.user.id}) used ${command.name} in ${int.channel.name} (${int.channel.id})`);
	}
	else if (int.isSelectMenu()) {
		if (int.customId != 'uniqueroleselect') return;

		const role = await uniqueRoles.findOne({ where: {
            guild_id: int.guild.id,
            role_id: int.values[0]
        } });
        if (!role) return int.reply({ content: 'you can\'t request that role (something may have gone wrong)', ephemeral: true });
		
        const guildRoles = await uniqueRoles.findAll({ where: {
            guild_id: int.guild.id
        } });
        const guildRoleIDs = guildRoles.map(role => role.role_id);
        
        const newRoles = int.member.roles.cache
            .map(role => {return role.id})
			.filter(role => !guildRoleIDs.includes(role));
		newRoles.push(int.values[0]);
		
        int.member.roles.set(newRoles);

		return int.reply({ content: `given role \`${role.role_name}\``, ephemeral: true });
	}
	else if (int.isButton()) {
		if (int.customId != 'uniqueroleremove') return;

		const guildRoles = await uniqueRoles.findAll({ where: {
			guild_id: int.guild.id
		} });
		const guildRoleIDs = guildRoles.map(role => role.role_id);

		const newRoles = int.member.roles.cache
			.filter(role => !guildRoleIDs.includes(role.id))
		
		int.member.roles.set(newRoles);

		return int.reply({ content: 'removed role', ephemeral: true });
	}
});

client.on('messageReactionAdd', async (reaction, user) => {
	if (reaction.emoji.name != "❌" || !reaction.message.requiredX) return;

	const xChannel = await channelTags.findOne({ where: {
		guild_id: reaction.message.guild.id,
		channel_id: reaction.message.channel.id,
		x: 1
	} });
	if (!xChannel) return;

	console.info(`${reaction.count} ❌ placed on message with ${reaction.message.requiredX} required in channel with ${reaction.message.channel.xRecentMessages.length} recent messages`);

	if (reaction.count < reaction.message.requiredX) return;

	const logChannels = await channelTags.findAll({ where: {
		guild_id: reaction.message.guild.id,
		log: 1
	} })
	const logChannelIDs = logChannels.map(channel => channel.channel_id);

	const embed = new Discord.MessageEmbed()
		.setTitle(`ID: ${reaction.message.id}`)
		.setURL(reaction.message.url)
		.setDescription(reaction.message.content+'\n'+reaction.message.attachments.map(value => {return value.url}).join('\n'))
		.setFooter({text: `${reaction.message.author.tag} (${reaction.message.author.id})`, iconURL: reaction.message.author.avatarURL({size:32})})
		.setTimestamp(reaction.message.createdTimestamp)
		.setColor(0x992e22);
	client.sendMessages(logChannelIDs, `Message by ${reaction.message.author.tag} (${reaction.message.author.id}) deleted from ${reaction.message.channel}`, {embeds: [embed]});

	reaction.message.delete();
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    try {
		const voiceChannels = await channelTags.findAll({ where: {
			guild_id: oldState.guild.id,
			voice: 1
		} })
		if (!voiceChannels[0]) return;
		const voiceChannelIDs = voiceChannels.map(channel => channel.channel_id);

		if (!oldState.channelId && newState.channelId) return client.sendMessages(voiceChannelIDs, `**${oldState.member.displayName}** joined **${newState.channel.name}**.`);
		else if (oldState.channelId && !newState.channelId) return client.sendMessages(voiceChannelIDs, `**${oldState.member.displayName}** left **${oldState.channel.name}**.`);
		else if (oldState.channelId && newState.channelId && newState.channelId != oldState.channelId) return client.sendMessages(voiceChannelIDs, `**${oldState.member.displayName}** moved to **${newState.channel.name}** from **${oldState.channel.name}**.`);
	}
	catch (error) {console.error(error)}
});

client.login(token);
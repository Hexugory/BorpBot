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
const client = new Discord.Client({ intents: intents });


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
	msg.channel.xRecentMessages = msg.channel.xRecentMessages.filter(msg => msg.createdAt > now-xConfig.activityTime);

	const uniqueIDs = [];
	for (let recentMsg of msg.channel.xRecentMessages) {
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

const cooldowns = new Discord.Collection();

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

client.on('message', async (msg) => {
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

client.on('interaction', async (int) => {
	if (!int.isCommand()) return;
	
	const command = client.slashCommands.get(int.commandName);

	command.execute(int).catch(error => {
		int.reply({ content: 'there was an error\nping guy 19 times', ephemeral: true });
		return console.error(error);
	});
});

client.on('messageReactionAdd', async (reaction, user) => {
	if (reaction.emoji.name != "❌" || !reaction.message.requiredX) return;

	const xChannel = await channelTags.findOne({ where: {
		guild_id: reaction.message.guild.id,
		channel_id: reaction.message.channel.id,
		x: 1
	} });
	if (!xChannel) return;

	if (reaction.count < reaction.message.requiredX) return;

	const logChannels = await channelTags.findAll({ where: {
		guild_id: reaction.message.guild.id,
		log: 1
	} })
	const logChannelIDs = logChannels.map(channel => channel.channel_id);

	client.sendMessages(logChannelIDs, `Deleted ${reaction.message.author.tag}[${reaction.message.author.id}]'s message[${reaction.message.id}]`);

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

		if (!oldState.channelID && newState.channelID) return client.sendMessages(voiceChannelIDs, `**${oldState.member.displayName}** joined **${newState.channel.name}**.`);
		else if (oldState.channelID && !newState.channelID) return client.sendMessages(voiceChannelIDs, `**${oldState.member.displayName}** left **${oldState.channel.name}**.`);
		else if (oldState.channelID && newState.channelID && newState.channelID != oldState.channelID) return client.sendMessages(voiceChannelIDs, `**${oldState.member.displayName}** moved to **${newState.channel.name}** from **${oldState.channel.name}**.`);
	}
	catch (error) {console.error(error)}
});

client.login(token);
const fs = require('fs');
const path = require('path');
const { SlashCreator, GatewayServer } = require('slash-create');
const Discord = require('discord.js');
const { prefix, token, owner, pubkey, clientid } = require('./config.json');
const ArgHandler = require('./argHandler.js');
const Sequelize = require('sequelize');
const moment = require('moment');

const client = new Discord.Client();

client.commands = new Discord.Collection();
client.argHandler = new ArgHandler();
client.db = new Sequelize({
	dialect: 'sqlite',
	storage: './database.sqlite',
	logging: false
});

const creator = new SlashCreator({
	applicationID: clientid,
	publicKey: pubkey,
	token: token
});

function sendMessages (arr, content, options = {}) {
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

module.exports = {db: client.db, sendMessages: sendMessages};

creator
	.withServer(
		new GatewayServer(
			(handler) => client.ws.on('INTERACTION_CREATE', handler)
		)
	)
	.registerCommandsIn(path.join(__dirname, 'slash'))
	.syncCommands({deleteCommands: true})
	.on('commandError', (command, err, ctx) => {return console.error(err)})
	.on('error', (err) => {return console.error(err)})
	.on('commandRegister', (command, cr) => {return console.log(command)});

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

const customCommands = client.db.import('./models/customCommands');
customCommands.sync();

const channelTags = client.db.import('./models/channelTags');
channelTags.sync();

const xConfigs = client.db.import('./models/xConfigs');
xConfigs.sync();

const blacklistUsers = client.db.import('./models/blacklistedUsers');
blacklistUsers.sync();

const commandBlacklist = client.db.import('./models/commandBlacklist');
commandBlacklist.sync();

const suggestions = client.db.import('./models/suggestions');
suggestions.sync();

const uniqueRoles = client.db.import('./models/uniqueRoles');
uniqueRoles.sync();

const reminders = client.db.import('./models/reminders');
reminders.sync();

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
	if(msg.content.toLowerCase().includes("press 🇫 to pay respects")
	   || msg.content.toLowerCase().includes("press f to pay respects")){
		msg.react('\u{1f1eb}');
	};

	if(msg.guild) xCalculation(msg);

	if (!msg.content.startsWith(prefix) || msg.author.bot) return;

	if (msg.author.id != owner && (await blacklistUsers.findOne({ where: { user_id: msg.author.id, blacklisted: 1 } }))) return;

	const args = client.argHandler.formatArgs(msg.content.slice(prefix.length));
    const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) {
		const guildCommands = await customCommands.findAll({ where: {
			guild_id: msg.guild.id
		} });
		const customCommand = guildCommands.find(command => { return command.name === commandName });
		if (!customCommand) return;

		const memeChannel = await channelTags.findOne({ where: {
			guild_id: msg.guild.id,
			channel_id: msg.channel.id,
			meme: 1
		} });
		if (!memeChannel
			 && !msg.member.hasPermission('MANAGE_MESSAGES')
			 && msg.author.id != owner) 
			 return msg.reply('you can\'t use custom commands in this channel');

		return msg.channel.send(customCommand.response);
	};

	if (msg.author.id != owner) {
		const member = (await commandBlacklist.findOrCreate({ where: { user_id: msg.author.id, guild_id: msg.guild.id } }))[0];
		if (JSON.parse(member.blacklist)[command.name]) {
			return;
		}
	}

	if (command.ownerOnly && msg.author.id != owner) {
		return msg.reply('why would you be allowed to use that command')
	} 

	if (command.guildOnly && msg.channel.type !== 'text') {
		return msg.reply('i\'m not sure what you were expecting, but that command doesn\'t work in DMs');
	}

	if (command.permission && msg.author.id != owner) {
		for(let permission of command.permission) {
			if (!msg.member.hasPermission(permission)) return msg.reply('you aren\'t allowed to use that command');
		}
	}

	if (command.args && !command.args[0].optional && !args.length) {
		let reply = 'i\'ll do that, as soon as you give me the command arguments';

		if (command.usage) {
			reply += `\nthe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return msg.channel.send(reply);
	}

	if (command.args && args.length < command.args.filter(arg => {return !arg.optional}).length) {
		let reply = 'you\'re missing arguments';

		if (command.usage) {
			reply += `\nthe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return msg.channel.send(reply);
	}

	if (command.cooldown && msg.author.id != owner) {
		if (!cooldowns.has(command.name)) {
			cooldowns.set(command.name, new Discord.Collection());
		}

		const now = Date.now();
		const timestamps = cooldowns.get(command.name);
		const cooldownAmount = (command.cooldown || 3) * 1000;

		if (timestamps.has(msg.author.id)) {
			const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return msg.reply(`wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command`);
			}
		}

		timestamps.set(msg.author.id, now);
		setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);
	}

	try {
        if(command.args) {
			if (!command.args[command.args.length-1].infinite) { 
				args[command.args.length-1] = args.slice(command.args.length-1, args.length).join(' ');
			}
			
            for(var i = 0; i < command.args.length; i++) {
                try {
					if (args[i]) {
						if (!command.args[i].infinite){
							args[i] = client.argHandler.parseArg(args[i], command.args[i].type, msg);
						}
						else {
							const infinite = [];
							for (var j = i; j < args.length; j++) {
								infinite.push(client.argHandler.parseArg(args[j], command.args[i].type, msg));
							}
							
							args[i] = infinite;
						}

						if (typeof command.args[i].validator === 'function'
						 && !command.args[i].validator(args[i], msg))
						 throw new Error('Argument is not valid');

						if (command.args[i].key) args[command.args[i].key] = args[i];
					}
                }
                catch (error) {
					msg.reply(`\`${args[i]}\` is an invalid argument`, { split: true });
					return console.error(error);
                }
            }
        }

		command.execute(msg, args);
    }
    catch (error) {
		console.error(error);
		msg.reply('there was an error\nping guy 19 times');
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

	if (reaction.count < reaction.message.requiredX) return;

	const logChannels = await channelTags.findAll({ where: {
		guild_id: reaction.message.guild.id,
		log: 1
	} })
	const logChannelIDs = logChannels.map(channel => channel.channel_id);

	sendMessages(logChannelIDs, `Deleted ${reaction.message.author.tag}[${reaction.message.author.id}]'s message[${reaction.message.id}]`);

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

		if (!oldState.channelID && newState.channelID) return sendMessages(voiceChannelIDs, `**${oldState.member.displayName}** joined **${newState.channel.name}**.`);
		else if (oldState.channelID && !newState.channelID) return sendMessages(voiceChannelIDs, `**${oldState.member.displayName}** left **${oldState.channel.name}**.`);
		else if (oldState.channelID && newState.channelID && newState.channelID != oldState.channelID) return sendMessages(voiceChannelIDs, `**${oldState.member.displayName}** moved to **${newState.channel.name}** from **${oldState.channel.name}**.`);
	}
	catch (error) {console.error(error)}
});

client.login(token);

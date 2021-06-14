const Discord = require('discord.js');
const fs = require('fs');
const { customCommands, commandBlacklist, channelTags } = require('./database.js');
const { prefix, owner } = require('./config.json');

const types = new Discord.Collection();
const typeFiles = fs.readdirSync('./types').filter(file => file.endsWith('.js'));

for (const file of typeFiles) {
	const type = require(`./types/${file}`);
	types.set(type.name, type);
}

module.exports = class CommandHandler {
    constructor () {
        this.types = types;
    }

    formatArgs (msg) {
        const args = msg.match(/("[^"]+")|(\S+)/g);
        for (let [i, arg] of args.entries()) {
            args[i] = arg.replace(/(^"|"$)/g, '');
        }
        
        return args;
    }

    parseArg (arg, type, msg) {
        var type = this.types.get(type);

        if (!type.validate(arg, msg)) throw new Error(`Argument is not a valid instance of type ${type.name}`);

        return type.parse(arg, msg);
    }

    async parseCommand (msg) {
        const args = this.formatArgs(msg.content.slice(prefix.length));
        const commandName = args.shift().toLowerCase();
    
        const command = msg.client.commands.get(commandName)
            || msg.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        
        if (!command) {
            return this.parseCustomCommand(msg, commandName);
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
            for (let permission of command.permission) {
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
                    return msg.reply(`wait ${timeLeft.toFixed(1)} more seconds before reusing the \`${command.name}\` command`);
                }
            }
    
            timestamps.set(msg.author.id, now);
            setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);
        }
    
        try {
            return this.runCommand(msg, command, args);
        }
        catch (error) {
            console.error(error);
            msg.reply('there was an error\nping guy 19 times');
        }
    }

    async parseCustomCommand (msg, commandName) {
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
                && !msg.member.permissionsIn(msg.channel).has(Discord.Permissions.FLAGS.MANAGE_MESSAGES)
                && msg.author.id != owner) 
                return msg.reply('you can\'t use custom commands in this channel');

        return msg.channel.send(customCommand.response);
    }

    runCommand (msg, command, args) {
        if(command.args) {
            if (!command.args[command.args.length-1].infinite) { 
                args[command.args.length-1] = args.slice(command.args.length-1, args.length).join(' ');
            }
            
            for(var i = 0; i < command.args.length; i++) {
                try {
                    if (args[i]) {
                        if (!command.args[i].infinite){
                            args[i] = this.parseArg(args[i], command.args[i].type, msg);
                        }
                        else {
                            const infinite = [];
                            for (var j = i; j < args.length; j++) {
                                infinite.push(this.parseArg(args[j], command.args[i].type, msg));
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

        console.info(`${msg.author.tag} (${msg.author.id}) used ${command.name} in ${msg.channel.name} (${msg.channel.id})`);
        command.execute(msg, args);
        return command;
    }
}
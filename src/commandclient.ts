import { Client, ClientOptions, Collection, GuildChannel, GuildMember, Message } from "discord.js";
import config from "./config.json";
import strings from "./clientstrings.json";
import { Sequelize } from "sequelize";
import { CommandList } from "./commands/commandlist";
import { Command } from "./commands/command";
import { BlacklistUsers } from "./models/blacklistusers";
import { CommandBlacklist } from "./models/commandblacklist";
import { SlashCommand } from "./slash/slash";
import { SlashCommandList } from "./slash/commandlist";

export class CommandClient extends Client {
    constructor (options: ClientOptions, db: Sequelize) {
        super(options);

        process.on('exit', this.destroy);

        process.on('SIGINT', this.destroy);

        this.db = db;

        for (const command of CommandList) {
            this.commands.set(command.name, command);
        }

        for (const command of SlashCommandList) {
            this.slashCommands.set(command.name, command);
        }

        this.on('messageCreate', async (msg: Message) => {
            if (!msg.content.startsWith(config.prefix) || msg.author.bot) return;

            if (msg.author.id != config.owner && (await BlacklistUsers.findOne({ where: { user_id: msg.author.id } }))) return;

            this.parseCommand(msg);
        });

        this.on('ready', () => {
            console.log(`Logged in as ${this.user!.tag}`);
        });

        this.on('interactionCreate', async (int) => {
            if (int.isCommand()) {
                if (!int.channel) return;

                const command = this.slashCommands.get(int.commandName);

                if (!command) throw new Error('Slash command does not exist');
        
                if (!int.guild && command.guildOnly) {
                    int.reply({ content: strings.command.guildOnly, ephemeral: true });
                    return;
                }

                if (command.permission && int.user.id != config.owner) {
                    if (!(int.channel instanceof GuildChannel)) {
                        int.reply({ content: strings.command.guildOnly, ephemeral: true });
                        return;
                    }
                    for (const permission of command.permission) {
                        if (!(int.member as GuildMember).permissionsIn(int.channel).has(permission)){
                            int.reply({ content: strings.command.noPermission, ephemeral: true });
                            return;
                        }
                    }
                }
        
                command.execute(int).catch(error => {
                    int.reply({ content: strings.error, ephemeral: true })
                    .catch(error => console.error(error));
                    return console.error(error);
                });
                return console.info(`${int.user.tag} (${int.user.id}) used ${command.name} in ${'name' in int.channel ? int.channel.name : 'DM CHANNEL'} (${int.channel.id})`);
            }
            else if (int.isAutocomplete()) {
                if (!int.channel) return;

                const command = this.slashCommands.get(int.commandName);

                if (!command) throw new Error('Slash command does not exist');
        
                command.autocomplete?.(int).catch(error => {
                    return console.error(error);
                });
            }
        });

        this.login(config.token);
    }

    /**
     * Gives an array of single or multi-word arguments
     * @param msg 
     * @returns 
     */
    static formatArgs (msg: string): string[] {
        const args = msg.match(/("[^"]+")|(\S+)/g);
        if (args === null) return [];
        for (let [i, arg] of args.entries()) {
            args[i] = arg.replace(/(^"|"$)/g, '');
        }
        
        return args;
    }

    async parseCommand (msg: Message): Promise<Command | undefined> {
        const args = CommandClient.formatArgs(msg.content.slice(config.prefix.length));
        
        if (args.length < 1) return;
        const commandName = args.shift()!.toLowerCase();
    
        const command: Command | undefined = this.commands.get(commandName)
            || this.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        
        if (!command) {
            this.nonCommandParse();
            return;
        };
    
        if (command.ownerOnly && msg.author.id != config.owner) {
            msg.reply(strings.command.ownerOnly);
            return;
        } 
    
        if (msg.channel instanceof GuildChannel) {
            if (!msg.member) throw new Error('Command sending member does not exist');
            
            if (msg.author.id != config.owner) {
                if (command.permission) {
                    for (const permission of command.permission) {
                        if (!msg.member.permissionsIn(msg.channel).has(permission)) {
                            msg.reply(strings.command.noPermission);
                            return;
                        }
                    }
                }
    
                const member = (await CommandBlacklist.findOrCreate({ where: { user_id: msg.author.id, guild_id: msg.guild!.id } }))[0];
                if (JSON.parse(member.blacklist)[command.name]) {
                    return;
                }
            }
        }

        if(command.guildOnly && !(msg.channel instanceof GuildChannel)) {
            msg.reply(strings.command.guildOnly);
            return;
        }
    
        if (command.args.length > 0 && !command.args[0].optional && args.length === 0) {
            let reply = strings.command.noArguments;
    
            if (command.usage) {
                reply += `\n${strings.command.usagePrefix} \`${config.prefix}${command.name} ${command.usage}\``;
            }
    
            msg.channel.send(reply);
            return;
        }
    
        if (args.length < command.args.filter(arg => {return !arg.optional}).length) {
            let reply = strings.command.missingArguments;
    
            if (command.usage) {
                reply += `\n${strings.command.usagePrefix} \`${config.prefix}${command.name} ${command.usage}\``;
            }
    
            msg.channel.send(reply);
            return;
        }
    
        if (command.cooldown && msg.author.id != config.owner) {
            if (!this.cooldowns.has(command.name)) {
                this.cooldowns.set(command.name, new Collection());
            }
    
            const now = Date.now();
            const timestamps = this.cooldowns.get(command.name);

            if (!timestamps) throw new Error('Command lacks cooldown collection');
    
            if (timestamps.has(msg.author.id)) {
                const expirationTime = (timestamps.get(msg.author.id) as number) + command.cooldown;
                const timeLeft = (expirationTime - now) / 1000;
                msg.reply(strings.command.onCooldown.replace('{1}', timeLeft.toFixed(1)).replace('{2}', command.name));
                return;
            }
    
            timestamps.set(msg.author.id, now);
            setTimeout(() => timestamps.delete(msg.author.id), command.cooldown);
        }
    
        try {
            return this.runCommand(msg, command, args);
        }
        catch (error) {
            console.error(error);
            msg.reply(strings.error);
        }
    }

    nonCommandParse () {
        return;
    }

    runCommand (msg: Message, command: Command, args: string[]): Command | undefined {
        if (!command.args[command.args.length-1].infinite) { 
            args[command.args.length-1] = args.slice(command.args.length-1, args.length).join(' ');
        }

        const parsedArgs: any[] = [];
        for(var i = 0; i < command.args.length; i++) {
            try {
                if (!command.args[i].infinite) {
                    if (!command.args[i].type.validate(args[i], msg)) throw new Error('Argument is invalid');
                    parsedArgs[i] = command.args[i].type.parse(args[i], msg);
                }
                else {
                    const infinite = [];
                    for (var j = i; j < args.length; j++) {
                        if (!command.args[i].type.validate(args[j], msg)) throw new Error('Argument is invalid');
                        infinite.push(command.args[i].type.parse(args[j], msg));
                    }
                    
                    parsedArgs[i] = infinite;
                }

                if (command.args[i].validator && !command.args[i].validator?.(args[i], msg)) throw new Error('Argument is invalid');
            }
            catch {
                msg.reply(strings.command.invalidArgument.replace('{1}', args[i]));
                return;
            }
        }
        const keyedArgs: { [key: string]: any } = {};
        for (var i = 0; i < command.args.length; i++) {
            keyedArgs[command.args[i].key] = parsedArgs[i];
        }

        console.info(`${msg.author.tag} (${msg.author.id}) used ${command.name} in ${'name' in msg.channel ? msg.channel.name : 'DM CHANNEL'} (${msg.channel.id})`);
        command.execute(msg, keyedArgs);
        return command;
    }

    readonly commands = new Collection<string, Command>();
    readonly slashCommands = new Collection<string, SlashCommand>();
    readonly cooldowns = new Collection<string, Collection<string, number>>();
    db: Sequelize
}
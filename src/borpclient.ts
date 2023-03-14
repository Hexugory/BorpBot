import { ClientOptions, Collection, GuildMemberRoleManager, Message, EmbedBuilder, MessagePayload, Snowflake, TextBasedChannel, ChannelType, VoiceState, MessageCreateOptions } from "discord.js";
import { Sequelize } from "sequelize";
import { CommandClient } from "./commandclient";
import { ChannelTags } from "./models/channeltags";
import { Reminders } from "./models/reminders";
import { XConfigs } from "./models/xconfigs";
import config from "./config.json";
import { UniqueRoles } from "./models/uniqueroles";
import { ToggleRoles } from "./models/toggleroles";

export class BorpClient extends CommandClient {
    constructor (options: ClientOptions, db: Sequelize) {
        super (options, db);

        this.once('ready', () => {
            setInterval(async () => {
                const allReminders = await Reminders.findAll();
                for (const reminder of allReminders) {
                    if (new Date().getTime() < reminder.time.getTime()) continue;
        
                    const sender = this.users.resolve(reminder.user_id);
                    if (sender) {
                        sender.send(`you asked to be reminded of: ${reminder.reminder}`);
                    }
        
                    await reminder.destroy();
                }
            }, 60000);
        });

        this.on('messageCreate', async (msg) => {
            if (msg.content.toLowerCase().includes("press 🇫 to pay respects")
               || msg.content.toLowerCase().includes("press f to pay respects")){
                msg.react('\u{1f1eb}');
            };
        
            if (msg.channel.id === '637483955666550833') {
                await msg.react('\u{1F44D}');
                await msg.react('\u{1F44E}');
            }
        
            if (msg.guild) this.xCalculation(msg);
        });

        this.on('interactionCreate', async (int) => {
            await (async () => {
                if (int.isStringSelectMenu()) {
                    if (int.customId != 'uniqueroleselect') return;
            
                    const role = await UniqueRoles.findOne({ where: {
                        guild_id: int.guild!.id,
                        role_id: int.values[0]
                    } });
                    if (!role) return int.reply({ content: 'you can\'t request that role (something may have gone wrong)', ephemeral: true });
                    
                    const guildRoles = await UniqueRoles.findAll({ where: {
                        guild_id: int.guild!.id
                    } });
                    const guildRoleIDs = guildRoles.map(role => role.role_id);
                    
                    const newRoles = (int.member!.roles as GuildMemberRoleManager).cache
                        .map(role => {return role.id})
                        .filter(role => !guildRoleIDs.includes(role));
                    newRoles.push(int.values[0]);
                    
                    (int.member!.roles as GuildMemberRoleManager).set(newRoles);
            
                    return int.reply({ content: `given role \`${role.role_name}\``, ephemeral: true });
                }
                else if (int.isButton()) {
                    console.info(`${int.user.tag} used ${int.customId}`);
            
                    if (int.customId === 'uniqueroleremove') {
                        const guildRoles = await UniqueRoles.findAll({ where: {
                            guild_id: int.guild!.id
                        } });
                        const guildRoleIDs = guildRoles.map(role => role.role_id);
            
                        const newRoles = (int.member!.roles as GuildMemberRoleManager).cache
                            .filter(role => !guildRoleIDs.includes(role.id))
                        
                        await (int.member!.roles as GuildMemberRoleManager).set(newRoles);
            
                        return int.reply({ content: 'removed role', ephemeral: true });
                    }
                    
                    if (!int.guild) return;
    
                    const role = await ToggleRoles.findOne({ where: {
                        guild_id: int.guild.id,
                        role_id: int.customId
                    } });
                    if (!role) return int.reply({ content: 'you can\'t request that role (something may have gone wrong)', ephemeral: true });
            
                    const memberRole = (int.member!.roles as GuildMemberRoleManager).resolve(int.customId);
                    if (!memberRole) {
                        await (int.member!.roles as GuildMemberRoleManager).add(int.customId);
                        return int.reply({ content: `given role \`${role.role_name}\``, ephemeral: true });
                    }
                    else {
                        await (int.member!.roles as GuildMemberRoleManager).remove(int.customId);
                        return int.reply({ content: 'removed role', ephemeral: true });
                    }
                }
            })();
        });

        this.on('messageReactionAdd', async (reaction, user) => {
            const msg = reaction.message as xMessage;
            if (!msg.guild || !reaction.count || reaction.emoji.name != "❌" || !msg.requiredX) return;
        
            const xChannel = await ChannelTags.findOne({ where: {
                channel_id: msg.channel.id,
                x: 1
            } });
            if (!xChannel) return;
        
            console.info(`${reaction.count} ❌ placed on message with ${msg.requiredX} required in channel with ${this.xRecentMessages.get(msg.channelId)!.length} recent messages`);
        
            if (reaction.count < msg.requiredX) return;
        
            const logChannels = await ChannelTags.findAll({ where: {
                guild_id: msg.guildId!,
                log: 1
            } })
            const logChannelIDs = logChannels.map(channel => channel.channel_id);
        
            const embed = new EmbedBuilder()
                .setTitle(`ID: ${reaction.message.id}`)
                .setURL(reaction.message.url)
                .setDescription(reaction.message.content+'\n'+reaction.message.attachments.map(value => {return value.url}).join('\n'))
                .setFooter({
                    text: `${reaction.message.author?.tag} (${reaction.message.author?.id})`,
                    iconURL: reaction.message.author?.displayAvatarURL({size:32})
                })
                .setTimestamp(reaction.message.createdTimestamp)
                .setColor(0x992e22);
            this.sendMessages(logChannelIDs, {embeds: [embed], content: `Message by ${reaction.message.author?.tag} (${reaction.message.author?.id}) deleted from ${reaction.message.channel}`});
        
            reaction.message.delete();
        });

        this.on('voiceStateUpdate', async (oldState, newState) => {
            try {
                if (!(oldState instanceof VoiceState) || !(newState instanceof VoiceState)) throw new Error('cry and scream and panic the voice types are fucked'); //i should not need to do this

                const voiceChannels = await ChannelTags.findAll({ where: {
                    guild_id: oldState.guild.id,
                    voice: 1
                } })
                if (!voiceChannels[0]) return;
                const voiceChannelIDs = voiceChannels.map(channel => channel.channel_id);

                var oldChannel = oldState.channel?.type === ChannelType.GuildStageVoice ? null : oldState.channel;
                var newChannel = newState.channel?.type === ChannelType.GuildStageVoice ? null : newState.channel;
        
                if (!oldChannel?.id && newChannel?.id) return this.sendMessages(voiceChannelIDs, `**${newState.member?.displayName}** joined **${newState.channel?.name}**.`);
                else if (oldChannel?.id && !newChannel?.id) return this.sendMessages(voiceChannelIDs, `**${oldState.member?.displayName}** left **${oldState.channel?.name}**.`);
                else if (oldChannel && newChannel && newChannel?.id != oldChannel?.id) return this.sendMessages(voiceChannelIDs, `**${oldState.member?.displayName}** moved to **${newState.channel?.name}** from **${oldState.channel?.name}**.`);
            }
            catch (error) {console.error(error)}
        });
    }

    /**
     * Sends a message to multiple channels
     * @param arr 
     * @param content 
     */
    sendMessages (arr: TextBasedChannel[] | string[], content: string | MessagePayload | MessageCreateOptions) {
        for (let channel of arr) {
            try {
                (this.channels.resolve(channel) as TextBasedChannel).send(content).catch(err => console.error(err));
            }
            catch (error) {console.error(error)}
        }
    }
    
    async xCalculation (message: Message) {
        const msg = message as xMessage;
        if (!msg.guild) throw new Error('X calculating DM message');

        const xChannel = await ChannelTags.findOne({ where: {
            channel_id: msg.channel.id,
            x: 1
        } });
        if (!xChannel) return;
    
        const xConfig = await XConfigs.findOne({ where: {
            channel_id: msg.channel.id
        } });
        if (!xConfig) return;
    
        const now = Date.now();
    
        if (!this.xRecentMessages.get(msg.channel.id)) this.xRecentMessages.set(msg.channel.id, []);
        var messageArray = this.xRecentMessages.get(msg.channel.id) as Message<boolean>[];
        messageArray.push(msg);
        messageArray = messageArray.filter(msg => msg.createdTimestamp > now-xConfig.activity_time);
        this.xRecentMessages.set(msg.channel.id, messageArray)
    
        const uniqueIDs: Snowflake[] = [];
        for (const recentMsg of messageArray) {
            if (!recentMsg.author.bot
                 && !uniqueIDs.includes(recentMsg.author.id)) uniqueIDs.push(recentMsg.author.id);
        }
    
        msg.requiredX = Math.max(Math.min(Math.ceil(xConfig.activity_ratio * uniqueIDs.length), xConfig.maximum), xConfig.minimum);
    }

    xRecentMessages = new Collection<Snowflake, Message[]>();
}

interface xMessage extends Message {
    requiredX: number | undefined
}
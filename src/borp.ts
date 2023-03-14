import { GatewayIntentBits, Partials } from "discord.js";
import { db } from "./database";
import { BorpClient } from "./borpclient";

const Client = new BorpClient({
    intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel, Partials.Reaction]
}, db);
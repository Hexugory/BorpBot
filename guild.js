const ArgumentType = require('./node_modules/discord.js-commando/src/types/base');
const disambiguation = require('./node_modules/discord.js-commando/src/util').disambiguation;
const escapeMarkdown = require('discord.js').escapeMarkdown;

class GuildArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'guild');
	}

	validate(value, msg) {
		const matches = value.match(/^(?:<#)?([0-9]+)>?$/);
		if(matches) return this.client.guilds.has(matches[1]);
		const search = value.toLowerCase();
		let guilds = this.client.guilds.array().filter(nameFilterInexact(search));
		if(guilds.length === 0) return false;
		if(guilds.length === 1) return true;
		const exactGuilds = guilds.filter(nameFilterExact(search));
		if(exactGuilds.length === 1) return true;
		if(exactGuilds.length > 0) guilds = exactGuilds;
		return `${disambiguation(guilds.map(guild => escapeMarkdown(guild.name)), 'guilds', null)}\n`;
	}

	parse(value, msg) {
		const matches = value.match(/^(?:<#)?([0-9]+)>?$/);
		if(matches) return this.client.guilds.get(matches[1]) || null;
		const search = value.toLowerCase();
		const guilds = this.client.guilds.array().filter(nameFilterInexact(search));
		if(guilds.length === 0) return null;
		if(guilds.length === 1) return guilds[0];
		const exactGuilds = guilds.filter(nameFilterExact(search));
		if(exactGuilds.length === 1) return guilds[0];
		return null;
	}
}

function nameFilterExact(search) {
	return thing => thing.name.toLowerCase() === search;
}

function nameFilterInexact(search) {
	return thing => thing.name.toLowerCase().includes(search);
}

module.exports = GuildArgumentType;

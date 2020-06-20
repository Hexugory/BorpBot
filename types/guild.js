module.exports = {
    name: 'guild',
    validate (arg, msg) {
        const guild = msg.client.guilds.cache.find(guild => { return guild.name.toLowerCase().startsWith(arg.toLowerCase()) });

        if (!guild) return false;

        return guild.members.resolve(msg.author.id);
    },
    parse (arg, msg) {
        return msg.client.guilds.cache.find(guild => { return guild.name.toLowerCase().startsWith(arg.toLowerCase()) });
    }
}
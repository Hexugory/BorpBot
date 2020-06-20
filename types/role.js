module.exports = {
    name: 'role',
    validate (arg, msg) {
        var id = arg.match(/<@&(\d+)>/);
        if (id) id = id[1];

        if (!id) {
            return msg.guild.roles.cache.filter(role => {return role.name.toLowerCase().startsWith(arg.toLowerCase())}).array().length === 1;
        }

        if (!msg.guild.roles.resolve(id)) return false;

        return true;
    },
    parse (arg, msg) {
        var id = arg.match(/<@!?(\d+)>/);
        if (id) id = id[1];

        if (!id) {
            return msg.guild.roles.cache.find(role => {return role.name.toLowerCase().startsWith(arg.toLowerCase())});
        }

        return msg.guild.roles.resolve(id);
    }
}
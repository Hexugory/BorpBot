module.exports = {
    name: 'member',
    validate (arg, msg) {
        var id = arg.match(/<@!?(\d+)>/);
        if (id) id = id[1];

        if (!id) {
            return msg.guild.members.cache.filter(member => {return member.user.username.toLowerCase().startsWith(arg.toLowerCase())}).size === 1;
        }

        if (!msg.guild.members.resolve(id)) return false;

        return true;
    },
    parse (arg, msg) {
        var id = arg.match(/<@!?(\d+)>/);
        if (id) id = id[1];

        if (!id) {
            return msg.guild.members.cache.find(member => {return member.user.username.toLowerCase().startsWith(arg.toLowerCase())});
        }

        return msg.guild.members.resolve(id);
    }
}
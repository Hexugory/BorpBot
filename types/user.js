module.exports = {
    name: 'user',
    validate (arg, msg) {
        var id = arg.match(/<@!?(\d+)>/);
        if (id) id = id[1];

        if (!id) {
            return msg.client.users.cache.filter(user => {return user.username.toLowerCase().startsWith(arg.toLowerCase())}).array().length === 1;
        }

        if (!msg.client.users.resolve(id)) return false;

        return true;
    },
    parse (arg, msg) {
        var id = arg.match(/<@!?(\d+)>/);
        if (id) id = id[1];

        if (!id) {
            return msg.client.users.cache.find(user => {return user.username.toLowerCase().startsWith(arg.toLowerCase())});
        }

        return msg.client.users.resolve(id);
    }
}
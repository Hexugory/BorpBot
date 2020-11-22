const { Collection } = require("discord.js");
const fs = require('fs');

const types = new Collection();
const typeFiles = fs.readdirSync('./types').filter(file => file.endsWith('.js'));

for (const file of typeFiles) {
	const type = require(`./types/${file}`);
	types.set(type.name, type);
}

module.exports = class ArgHandler {
    constructor () {
        this.types = types;
    }

    formatArgs (msg) {
        const args = msg.match(/("[^"]+")|(\S+)/g);
        for(let [i, arg] of args.entries()) {
            args[i] = arg.replace(/(^"|"$)/g, '');
        }
        
        return args;
    }

    parseArg (arg, type, msg) {
        var type = this.types.get(type);

        if(!type.validate(arg, msg)) throw new Error(`Argument is not a valid instance of type ${type.name}`);

        return type.parse(arg, msg);
    }
}
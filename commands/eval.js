module.exports = {
	name: 'eval',
    description: 'that thing',
    args: [
        {
            key: 'code',
            type: 'string'
        }
    ],
    ownerOnly: true,
	async execute(msg, args) {
        console.log(args.code);
        const result = eval(args.code);
        console.log(result);
        return msg.channel.send(result.toString());
	},
};

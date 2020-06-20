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
        return msg.channel.send(eval(args.code));
	},
};

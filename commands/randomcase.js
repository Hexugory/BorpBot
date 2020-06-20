module.exports = {
	name: 'randomcase',
    description: 'dOEs thIs',
    args: [
        {
            type: 'string'
        }
    ],
	async execute(msg, args) {
        var strSplit = args[0].toLowerCase().split('')
        for(let [i, char] of strSplit.entries()){
            if (Math.random() > 0.5) strSplit[i] = char.toUpperCase();
        }
        msg.channel.send(strSplit.join(''));
	},
};

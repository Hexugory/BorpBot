module.exports = {
	name: 'randomcase',
    description: 'dOEs thIs',
    args: [
        {
            name: 'text',
            type: 'STRING',
            description: 'Your message',
            required: true
        }
    ],
	async execute(msg, args) {
        var strSplit = int.options.get('text').toLowerCase().split('')
        for(let [i, char] of strSplit.entries()){
            if (Math.random() > 0.5) strSplit[i] = char.toUpperCase();
        }
        return int.reply({ content: strSplit.join('') });
	},
};

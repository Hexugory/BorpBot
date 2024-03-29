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
	async execute(int) {
        var strSplit = int.options.get('text').value.toLowerCase().split('');
        for(let [i, char] of strSplit.entries()){
            if (Math.random() > 0.5) strSplit[i] = char.toUpperCase();
        }
        return int.reply({ content: strSplit.join('') });
	},
};

const { MessageEmbed } = require('discord.js');
const { dubsLogs } = require('../database.js');

module.exports = {
	name: 'checkem',
    description: 'check \'em',
	async execute(msg, args) {
        const timestamp = new Date();

        const lastRoll = await dubsLogs.findOne({ where: {
            user_id: msg.author.id
        } });

        if (lastRoll && Math.floor(lastRoll.createdAt.getTime() / 86400000) === Math.floor(timestamp.getTime() / 86400000)) return msg.reply('farming');

        let roll = ""
        roll += Math.floor(Math.random()*9)+1;
        for (let i = 0; i < 8; i++) {
            roll += Math.floor(Math.random()*10);
        }

        await dubsLogs.create({
            user_id: msg.author.id,
            roll: parseInt(roll, 10)
        });

        const embed = new MessageEmbed();
        const timestampInSeconds = Math.floor(timestamp.getTime()/1000);
        embed.setTitle(`<t:${timestampInSeconds}:d> <t:${timestampInSeconds}:t> No.${roll}`);
        const d1 = roll.substring(roll.length-2, roll.length-1);
        const d2 = roll.substring(roll.length-1);
        if (d1 === d2) embed.setImage('https://game.touhoudiscord.net/~guyhero/Dubs_Guy.jpg');
        
        return msg.reply({ embeds: [embed] });
	},
};

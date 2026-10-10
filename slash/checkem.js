const { Interaction } = require("discord.js");
const { MessageEmbed } = require('discord.js');
const { dubsLogs } = require('../database.js');

module.exports = {
	name: 'checkem',
    description: 'check \'em',
    args: [
        {
            name: 'body',
            type: 'STRING',
            description: 'speak to the people',
            required: false
        }
    ],
    /**
     * 
     * @param {Interaction} int 
     * @returns 
     */
	async execute(int) {
        const timestamp = new Date();

        const lastRoll = await dubsLogs.findOne({
            where: {
                user_id: int.member.id
            },
            order: [['createdAt', 'DESC']]
        });

        if (lastRoll && Math.floor(lastRoll.createdAt.getTime() / 86400000) === Math.floor(timestamp.getTime() / 86400000)) return int.reply('farming');

        let roll = ""
        roll += Math.floor(Math.random()*9)+1;
        for (let i = 0; i < 8; i++) {
            roll += Math.floor(Math.random()*10);
        }

        let rollArray = roll.toString().split('').reverse();
        let scoreDigit = rollArray[0];
        let matchingDigits = [];
        for (let digit of rollArray) {
            if (digit == scoreDigit) matchingDigits.push(digit);
            else break;
        }
        if (matchingDigits[0] === '0') matchingDigits[0] = '1';

        await dubsLogs.create({
            user_id: int.member.id,
            roll: parseInt(roll, 10),
            score: parseInt(matchingDigits.join(''), 10)
        });

        const embed = new MessageEmbed();
        const timestampInSeconds = Math.floor(timestamp.getTime()/1000);
        embed.setTitle(`<t:${timestampInSeconds}:d> <t:${timestampInSeconds}:t> No.${roll}`);
        const d1 = roll.substring(roll.length-2, roll.length-1);
        const d2 = roll.substring(roll.length-1);
        if (d1 === d2) embed.setImage('https://game.touhoudiscord.net/~guyhero/Dubs_Guy.jpg');
        if (int.options.get('body').value) embed.setDescription(int.options.get('body').value);
        
        return int.reply({ embeds: [embed] });
	},
};

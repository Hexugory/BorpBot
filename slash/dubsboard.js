const { MessageEmbed } = require('discord.js');
const { dubsLogs } = require('../database.js');

module.exports = {
	name: 'dubsboard',
    description: 'run the numbers',
	async execute(int) {
        const top = await dubsLogs.findAll({
            order: [
                ['score', 'DESC'],
                ['roll', 'DESC']
            ],
            limit: 20
        });
        console.log(top);

        const embed = new MessageEmbed();
        let body = '';
        top.forEach(row => {
            console.log(row.id);
            const timestampInSeconds = Math.floor(row.createdAt.getTime()/1000);
            body += `<@${row.user_id}> <t:${timestampInSeconds}:d> <t:${timestampInSeconds}:t> No.${row.roll}\n`;
        });
        embed.setDescription(body);
        return int.reply({ embeds: [embed] });
	},
};

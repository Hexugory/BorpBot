const moment = require('moment');
const { reminders } = require('../database.js');

module.exports = {
	name: 'remindme',
    description: 'Sets a reminder',
    args: [
        {
            key: 'time',
            type: 'time'
        },
        {
            key: 'reminder',
            type: 'string'
        }
    ],
	async execute(msg, args) {
        const endTime = moment.utc();
        endTime.add(args.time);

        await reminders.create({
            sender_id: msg.author.id,
            time: endTime.toDate(),
            reminder: args.reminder
        });

        return msg.reply(`set a reminder for <t:${endTime.unix()}>`);
	},
};

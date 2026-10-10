const moment = require('moment');
const { reminders } = require('../database.js');
const TimeType = require('../types/time.js');

module.exports = {
	name: 'remindme',
    description: 'Sets a reminder',
    args: [
        {
            name: 'time',
            type: 'STRING',
            description: 'Time to wait',
            required: true
        },
        {
            name: 'reminder',
            type: 'STRING',
            description: 'Your message',
            required: true
        }
    ],
	async execute(int) {
        const endTime = moment.utc();
        const time = TimeType.parse(int.options.get('time').value, null);
        endTime.add(time);

        await reminders.create({
            sender_id: int.member.id,
            time: endTime.toDate(),
            reminder: int.options.get('reminder').value
        });

        return int.reply(`set a reminder for \`${int.options.get('reminder').value}\` at <t:${endTime.unix()}>`);
	},
};

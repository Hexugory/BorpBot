const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const moment = require('moment');

module.exports = class RemindMeCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'remindme',
			group: 'util',
			memberName: 'remindme',
			description: 'Will DM you after a set amount of time with a reminder.',
			examples: ['\'remindme "1 day" "make remindme command"'],

			args: [
				{
					key: 'time',
					label: 'time',
					prompt: 'Enter wait duration.',
					type: 'time'
				},
				{
					key: 'msg',
					label: 'message',
					prompt: 'Enter message.',
					type: 'string'
				}
			]
		});
	}
	

	async run(msg, args) {
		let endTime = moment.utc();
		let times = this.client.provider.get('global', 'times', []);
		endTime.add(args.time)
		times.push({time: endTime, user: msg.author.id, message: args.msg})
		this.client.provider.set('global', 'times', times);
		return msg.reply(`You will be reminded at ${endTime.format('MMMM Do YYYY, h:mm:ss a ZZ')}.`);
	}
};

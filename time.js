const ArgumentType = require('./node_modules/discord.js-commando/src/types/base');
const moment = require('moment');

class TimeArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'time');
	}

	validate(val, msg, arg) {
		const time = val.match(/\d+ ?(minute|hour|day|week|month|quarter|year)/ig);
		return time;
	}

	parse(val) {
		const time = val.match(/\d+ ?(minute|hour|day|week|month|quarter|year)/ig);
		let timeObject = {};
		for(var i = 0; i < time.length; i++){
			timeObject[time[i].match(/(minute|hour|day|week|month|quarter|year)/i)[0]] = parseInt(time[i].match(/\d+/i)[0], 10);
		}
		return timeObject;
	}
}

module.exports = TimeArgumentType;

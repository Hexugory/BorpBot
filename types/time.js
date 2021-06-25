module.exports = {
    name: 'time',
    validate (arg, msg) {
		return arg.match(/\d+ ?((minute|hour|day|week|month|quarter|year)|(m|h|d|w|y))/ig);
	},
	parse (arg, msg) {
        const timeMatches = arg.match(/\d+ ?((minute|hour|day|week|month|quarter|year)|(m|h|d|w|y))/ig);
        
		const durations = {};
		for (const time of timeMatches) {
            const duration = time.match(/(\d+) ?((minute|hour|day|week|month|quarter|year)|(m|h|d|w|y))/i);
			durations[duration[2]] = duration[1];
		}
		return durations;
	}
}
import { Argument } from "./arg";

export interface Duration {
    period: "minute" | "hour" | "day" | "week" | "month" | "year"
    amount: number
}

class HumanTimeArgumentClass implements Argument {
    name = 'humantime'

    validate (arg: string) {
        return arg.match(/\d+ ?((minute|hour|day|week|month|year)|(m|h|d|w|y))/ig) !== null;
    }

    parse (arg: string): Duration[] {
        const timeMatches = arg.match(/\d+ ?((minute|hour|day|week|month|year)|(m|h|d|w|y))/ig);
        
		const durations: Duration[] = [];
		for (const time of timeMatches!) {
            const duration = time.match(/(\d+) ?((minute|hour|day|week|month|year)|(m|h|d|w|y))/i);
            switch (duration![2]) {
                case 'm':
                    duration![2] = "minute";
                    break;
                case 'h':
                    duration![2] = "hour";
                    break;
                case 'd':
                    duration![2] = "day";
                    break;
                case 'w':
                    duration![2] = "week";
                    break;
                case 'y':
                    duration![2] = "year";
                    break;
            }
            const period = duration![2] as "minute" | "hour" | "day" | "week" | "month" | "year"
			durations.push({
                period: period,
                amount: parseInt(duration![1], 10)
            });
		}
		return durations;
    }
};

export const HumanTimeArgument = new HumanTimeArgumentClass();
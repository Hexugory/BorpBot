import { Argument } from "./arg";

class StringArgumentClass implements Argument {
    name = 'string'

    validate (arg: string): arg is string {
        return typeof arg === 'string';
    }

    parse (arg: string): string {
        return arg;
    }
};

export const StringArgument = new StringArgumentClass();
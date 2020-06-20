module.exports = {
    name: 'string',
    validate (arg) {
        return typeof arg === 'string';
    },
    parse (arg) {
        return arg;
    }
}
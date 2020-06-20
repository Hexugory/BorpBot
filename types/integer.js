module.exports = {
    name: 'integer',
    validate (arg) {
        return !isNaN(parseInt(arg, 10));
    },
    parse (arg) {
        return parseInt(arg, 10);
    }
}
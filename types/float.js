module.exports = {
    name: 'float',
    validate (arg) {
        return !isNaN(parseFloat(arg));
    },
    parse (arg) {
        return parseFloat(arg);
    }
}
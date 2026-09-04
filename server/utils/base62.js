const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function encode(num) {
    if (num === 0) return CHARS[0];
    let result = '';
    while (num > 0) {
        result = CHARS[num % 62] + result;
        num = Math.floor(num / 62);
    }
    return result;
}

function decode(str) {
    return str.split('').reduce((acc, char) => {
        return acc * 62 + CHARS.indexOf(char);
    }, 0);
}

module.exports = { encode, decode, default: { encode, decode } };
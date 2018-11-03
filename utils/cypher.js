const SHA256 = require('crypto-js/sha256');

toHash = value => SHA256(JSON.stringify(value)).toString();

toHexEncode = value => Buffer.from(value, 'ascii').toString('hex');

toHexDecode = value => Buffer.from(value, 'hex').toString('ascii');

module.exports = {
    toHash
    , toHexEncode
    , toHexDecode
}
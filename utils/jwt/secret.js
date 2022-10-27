const crypto = require('crypto');
require('../../config/env');

function generateRandomSecretKey() {
    return crypto.randomBytes(64).toString('hex');
}

// const secretKey = generateRandomSecretKey();
// console.log('secretKey :>> ', secretKey);

module.exports = { generateRandomSecretKey };
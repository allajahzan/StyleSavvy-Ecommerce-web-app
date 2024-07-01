const {v4: uuidv4} = require('uuid');

const secretKey = uuidv4();
module.exports = secretKey;
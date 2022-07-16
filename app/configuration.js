const path = require('path');
const fs = require('fs');

const configuration = JSON.parse(
    fs.readFileSync(path.join(
        __dirname, '..', 'config', 'proxy.json'
    )).toString()
);

module.exports = configuration;
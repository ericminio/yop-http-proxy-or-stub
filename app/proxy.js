const request = require('./request');
const { Server } = require('./server');
const path = require('path');
const configuration = JSON.parse(require('fs').readFileSync(
    path.join(__dirname, '..', 'config', 'proxy.json')).toString());
const proxy = new Server(configuration.port);
proxy.service = { port: configuration.service.port };

module.exports = {
    proxy
};

proxy.start(() => {
    console.log(`listening on port ${proxy.port}`);
});

proxy.use((icoming, response) => {
    request({ 
        port: proxy.service.port
    })
        .then(answer => {
            response.statusCode = answer.statusCode;
            response.setHeader('content-type', answer.headers['content-type']);
            response.end(answer.payload);        
        });
});

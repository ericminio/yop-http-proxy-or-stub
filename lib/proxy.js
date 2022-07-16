const request = require('../spec/support/request');
const { Server } = require('../spec/support/server');
const proxy = new Server(5001);
proxy.port = 5005;
proxy.service = { port: 5015 };

module.exports = {
    proxy
};

proxy.start(() => {
    console.log(`listening on port ${proxy.port}`);
});

proxy.use((icoming, response) => {
    request({ port: proxy.service.port })
        .then(answer => {
            response.writeHead(200, { 'content-Type': answer.headers['content-type'] });
            response.end(answer.payload);        
        });
});

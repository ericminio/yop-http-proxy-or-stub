const { Server } = require('./server');
const configuration = require('./configuration');
const { extractPayload } = require('./extract-payload');
const proxy = new Server(configuration.port);
proxy.service = configuration.service;

module.exports = {
    proxy
};

proxy.start(() => {
    console.log(`listening on port ${proxy.port}`);
});
proxy.debug = (message) => {
    if (proxy.logger !== undefined) {
        proxy.logger(message);
    }
};

proxy.use((incoming, response) => {
    proxy.debug(`\n${incoming.method} ${incoming.url}\n`);
    proxy.debug(`headers: ${JSON.stringify(incoming.headers)}\n`);
    extractPayload(incoming).then(payload => {
        proxy.debug(`payload: ${payload}\n`);
        require('./request')({ 
            host: proxy.service.host,
            port: proxy.service.port,
            method: incoming.method,
            path: incoming.url,
            headers: incoming.headers,
            payload,
        })
            .then(answer => {
                response.statusCode = answer.statusCode;
                response.setHeader('content-type', answer.headers['content-type']);
                response.end(answer.payload);        
            });    
    });
});

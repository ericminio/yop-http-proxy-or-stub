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

proxy.use((incoming, response) => {
    extractPayload(incoming).then(payload => {
        require('./request')({ 
            host: proxy.service.host,
            port: proxy.service.port,
            method: incoming.method,
            path: incoming.url,
            payload,
        })
            .then(answer => {
                response.statusCode = answer.statusCode;
                response.setHeader('content-type', answer.headers['content-type']);
                response.end(answer.payload);        
            });    
    });
});

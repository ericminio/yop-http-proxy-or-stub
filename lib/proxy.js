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
    response.writeHead(200, { 'content-Type': 'text/plain' });
    response.end('pong');
});

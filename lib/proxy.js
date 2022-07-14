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

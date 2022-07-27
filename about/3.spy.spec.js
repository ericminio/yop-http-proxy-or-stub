const { expect } = require('chai');
const request = require('../app/request');
const { proxy } = require('../app/proxy');
const { Server } = require('../app/server');

describe('spy', () => {

    let service;

    beforeEach((done) => {
        service = new Server(proxy.service.port);
        service.start(done);
    });
    afterEach((done) => {
        service.stop(done);
    });

    it('logs incoming', (done) => {
        service.use((incoming, response) => {
            response.writeHead(200, { 'content-Type': 'text/plain' });
            response.end('pong');
        });
        let received = [];
        proxy.logger = (message) => { received.push(message) };
        request({ 
            port: proxy.port, 
            method: 'POST',
            path:'/this/url',
            headers: {
                'x-1': '4',
                'x-2': '2'
            },
            payload: 'this payload'
        })
            .then(() => {
                expect(received).to.deep.equal([
                    '\nPOST /this/url\n',
                    `headers: ${JSON.stringify({ 
                        'x-1': '4', 
                        'x-2': '2', 
                        'host':'localhost:5005',
                        'connection': 'close',
                        'transfer-encoding': 'chunked'
                    })}\n`,
                    'payload: this payload\n'
                ])
                done();
            })
            .catch(done);
    });
});

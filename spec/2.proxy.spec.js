const { expect } = require('chai');
const request = require('./support/request');
const { proxy } = require('../lib/proxy');
const { Server } = require('./support/server');

describe('proxy', () => {

    let service;

    beforeEach((done) => {
        service = new Server(proxy.service.port);
        service.start(done);
    });
    afterEach((done) => {
        service.stop(done);
    });
    after((done) =>{
        proxy.stop(done);
    });

    it('propagates request', (done) => {
        service.use((incoming, response) => {
            response.writeHead(200, { 'content-Type': 'text/plain' });
            response.end('pong');
        });
        request({ port: proxy.port })
            .then(answer => {
                expect(answer.statusCode).to.equal(200);
                expect(answer.headers['content-type']).to.equal('text/plain');
                expect(answer.payload).to.equal('pong');
                done();
            })
            .catch(done);
    });
});

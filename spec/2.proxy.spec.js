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
            response.writeHead(200, { 'content-Type': 'application/json' });
            response.end(JSON.stringify({
                method: incoming.method,
                url: incoming.url,
            }));
        });
        request({ port: proxy.port, path: '/this/url' })
            .then(answer => {
                expect(answer.statusCode).to.equal(200);
                expect(answer.headers['content-type']).to.equal('application/json');
                expect(answer.payload).to.deep.equal({
                    method: 'GET',
                    url: '/this/url'
                });
                done();
            })
            .catch(done);
    });
});

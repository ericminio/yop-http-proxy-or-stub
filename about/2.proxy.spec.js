const { expect } = require('chai');
const request = require('../app/request');
const { proxy } = require('../app/proxy');
const { Server } = require('../app/server');

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
            response.end(`${incoming.method} ${incoming.url}`);
        });
        request({ 
            port: proxy.port, 
            method: 'POST',
            path:'/this/url' 
        })
            .then(answer => {
                expect(answer.statusCode).to.equal(200);
                expect(answer.headers['content-type']).to.equal('text/plain');
                expect(answer.payload).to.equal('POST /this/url');
                done();
            })
            .catch(done);
    });
});

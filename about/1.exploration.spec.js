const { expect } = require('chai');
const request = require('../app/request');
const { Server } = require('../app/server');

describe('exploration', () => {

    let proxy;
    let service;

    beforeEach((done) => {
        service = new Server(5002);
        proxy = new Server(5001);
        service.start(() => {
            proxy.start(done);
        });
    });
    afterEach((done) => {
        proxy.stop(() => {
            service.stop(done);
        });
    });

    it('looks promising', (done) => {
        service.use((incoming, response) => {
            response.writeHead(200, { 'content-Type': 'text/plain' });
            response.end('hello world');
        });
        proxy.use((incoming, response) => {
            request({ port: 5002 })
                .then(answer => {
                    response.writeHead(200, { 'content-Type': 'text/plain' });
                    response.end(answer.payload);
                });
        });
        request({ port: 5001 })
            .then(answer => {
                expect(answer.statusCode).to.equal(200);
                expect(answer.payload).to.equal('hello world');
                done();
            })
            .catch(done);
    });
});

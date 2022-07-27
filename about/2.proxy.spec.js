const { expect } = require('chai');
const request = require('../app/request');
const { proxy } = require('../app/proxy');
const { Server } = require('../app/server');
const { extractPayload } = require('../app/extract-payload');

describe('proxy', () => {

    let service;

    beforeEach((done) => {
        service = new Server(proxy.service.port);
        service.start(done);
    });
    afterEach((done) => {
        service.stop(done);
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

    it('propagates payload', (done) => {
        service.use((incoming, response) => {
            extractPayload(incoming).then(payload => {          
                response.writeHead(200, { 'content-Type': 'text/plain' });
                response.end(`received: ${payload}`);
            });
        });
        request({ 
            port: proxy.port, 
            method: 'POST',
            payload: 'this payload'
        })
            .then(answer => {
                expect(answer.statusCode).to.equal(200);
                expect(answer.headers['content-type']).to.equal('text/plain');
                expect(answer.payload).to.equal('received: this payload');
                done();
            })
            .catch(done);
    });

    it('propagates headers', (done) => {
        service.use((incoming, response) => {
            let payload = JSON.stringify(incoming.headers);
            response.writeHead(200, { 'content-Type': 'text/plain' });
            response.end(payload);
        });
        request({ 
            port: proxy.port, 
            headers: {
                'x-1': '4',
                'x-2': '2'
            }
        })
            .then(answer => {
                expect(answer.statusCode).to.equal(200);
                expect(answer.headers['content-type']).to.equal('text/plain');
                expect(JSON.parse(answer.payload)).to.include({
                    host: `localhost:${proxy.port}`,
                    'x-1': '4',
                    'x-2': '2'
                });
                done();
            })
            .catch(done);
    });

    it('answers with headers from service', (done) => {
        service.use((incoming, response) => {
            response.statusCode = 200;
            response.setHeader('x-answer', '42');
            response.end('pong');
        });
        request({ port: proxy.port })
            .then(answer => {
                expect(answer.statusCode).to.equal(200);
                expect(answer.headers['x-answer']).to.equal('42');
                done();
            })
            .catch(done);
    });

    it('answers with statusCode from service', (done) => {
        service.use((incoming, response) => {
            response.statusCode = 404;
            response.end();
        });
        request({ port: proxy.port })
            .then(answer => {
                expect(answer.statusCode).to.equal(404);
                done();
            })
            .catch(done);
    });

    it('answers with payload from service', (done) => {
        service.use((incoming, response) => {
            response.statusCode = 200;
            response.end('hello');
        });
        request({ port: proxy.port })
            .then(answer => {
                expect(answer.statusCode).to.equal(200);
                expect(answer.payload).to.equal('hello');
                done();
            })
            .catch(done);
    });
});

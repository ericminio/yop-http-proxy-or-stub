const extractPayload = (incoming) => {
    return new Promise((resolve, reject) => {
        let payload = '';
        incoming.on('data', chunk => {
            payload += chunk;
        });
        incoming.on('end', () => {
            resolve(payload);
        });
        incoming.on('error', reject)
    });
}

module.exports = { extractPayload };
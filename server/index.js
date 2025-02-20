const dgram = require('dgram');
const server = dgram.createSocket('udp4');

const PORT = 41234;
const HOST = '127.0.0.1';

server.on('error', (err) => {
    console.log(`Server error:\n${err.stack}`);
    server.close();
});

server.on('message', (msg, rinfo) => {
    console.log(`Server received: ${msg} from ${rinfo.address}:${rinfo.port}`);
    // Echo the message back to the client
    server.send(msg, rinfo.port, rinfo.address, (err) => {
        if (err) console.error('Failed to send response:', err);
    });
});

server.on('listening', () => {
    const address = server.address();
    console.log(`Server listening on ${address.address}:${address.port}`);
});

server.bind(PORT, HOST);

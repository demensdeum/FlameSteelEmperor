const dgram = require('dgram');
const Universe = require('./universe');

const server = dgram.createSocket('udp4');
const universe = new Universe();

const PORT = 41234;
const HOST = '127.0.0.1';

server.on('error', (err) => {
    console.log(`Server error:\n${err.stack}`);
    server.close();
});

server.on('message', (msg, rinfo) => {
    console.log(`Server received: ${msg} from ${rinfo.address}:${rinfo.port}`);
    
    try {
        const response = universe.clientCommandsHandler.handle(msg.toString());
        const responseStr = JSON.stringify(response);
        server.send(responseStr, rinfo.port, rinfo.address, (err) => {
            if (err) console.error('Failed to send response:', err);
        });
    } catch (error) {
        console.error('Error handling message:', error);
        const errorResponse = JSON.stringify({
            type: 'error',
            error: 'Internal server error'
        });
        server.send(errorResponse, rinfo.port, rinfo.address, (err) => {
            if (err) console.error('Failed to send error response:', err);
        });
    }
});

server.on('listening', () => {
    const address = server.address();
    console.log(`Server listening on ${address.address}:${address.port}`);
});

server.bind(PORT, HOST);

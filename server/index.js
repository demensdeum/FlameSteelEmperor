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
    const msgStr = msg.toString();
    console.log(`Server received: ${msgStr} from ${rinfo.address}:${rinfo.port}`);
    
    try {
        // Parse incoming message
        let data;
        try {
            data = JSON.parse(msgStr);
            console.log('Parsed message:', data);
        } catch (parseError) {
            throw new Error('Invalid message format - expected JSON');
        }

        // Handle command
        console.log('Handling command with type:', data.type);
        const response = universe.clientCommandsHandler.handle(data);
        console.log('Handler response:', response);
        const responseStr = JSON.stringify(response);
        
        // Send response
        server.send(responseStr, rinfo.port, rinfo.address, (err) => {
            if (err) console.error('Failed to send response:', err);
            else console.log('Sent response:', responseStr);
        });
    } catch (error) {
        console.error('Error handling message:', error.message);
        const errorResponse = JSON.stringify({
            type: 'error',
            error: error.message || 'Internal server error'
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

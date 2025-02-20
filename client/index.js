const dgram = require('dgram');
const readline = require('readline');

const client = dgram.createSocket('udp4');

const SERVER_PORT = 41234;
const SERVER_HOST = '127.0.0.1';

// Create readline interface for CLI input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Handle incoming messages from server
client.on('message', (msg) => {
    console.log(`Server response: ${msg}`);
});

// Handle errors
client.on('error', (err) => {
    console.error(`Client error:\n${err.stack}`);
    client.close();
});

// Prompt for input
function promptUser() {
    rl.question('Enter message (or "exit" to quit): ', (message) => {
        if (message.toLowerCase() === 'exit') {
            rl.close();
            client.close();
            return;
        }

        // Send message to server
        client.send(message, SERVER_PORT, SERVER_HOST, (err) => {
            if (err) {
                console.error('Failed to send message:', err);
            }
        });

        // Continue prompting
        promptUser();
    });
}

// Start prompting
promptUser();

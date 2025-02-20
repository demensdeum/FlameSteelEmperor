const dgram = require('dgram');

class Client {
    constructor() {
        this.client = dgram.createSocket('udp4');
        this.SERVER_PORT = 41234;
        this.SERVER_HOST = '127.0.0.1';
        
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.client.on('error', (err) => {
            console.error(`Client error:\n${err.stack}`);
            this.client.close();
        });
    }

    send(command) {
        return new Promise((resolve, reject) => {
            const messageStr = JSON.stringify(command);
            console.log('Sending command:', command);
            let timeoutId = null;
            
            // Setup one-time response handler using once
            this.client.once('message', (msg) => {
                clearTimeout(timeoutId);
                const rawResponse = msg.toString();
                console.log('Received raw response:', rawResponse);
                try {
                    const response = JSON.parse(rawResponse);
                    console.log('Parsed response:', response);
                    resolve(response);
                } catch (error) {
                    console.error('Failed to parse response:', rawResponse);
                    reject(new Error('Invalid response format'));
                }
            });

            // Send the command
            this.client.send(messageStr, this.SERVER_PORT, this.SERVER_HOST, (err) => {
                if (err) {
                    console.error('Failed to send command:', err);
                    reject(err);
                } else {
                    console.log('Command sent successfully');
                }
            });

            // Setup timeout
            timeoutId = setTimeout(() => {
                console.log('Request timed out');
                reject(new Error('Request timed out'));
            }, 5000);
        });
    }

    close() {
        this.client.close();
    }
}

module.exports = Client;

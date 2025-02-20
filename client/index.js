const readline = require('readline');
const Client = require('./client');
const Login = require('./login');

const client = new Client();
const login = new Login(client);

// Create readline interface for CLI input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function handleCommand(command) {
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();

    try {
        switch (cmd) {
            case 'login':
                if (parts.length < 2) {
                    console.log('Usage: login <username>');
                    return;
                }
                const success = await login.performLogin(parts[1]);
                if (success) {
                    console.log('Login successful!');
                } else {
                    console.log('Login failed.');
                }
                break;

            case 'logout':
                if (!login.isLoggedIn()) {
                    console.log('Not logged in.');
                    return;
                }
                const logoutSuccess = await login.performLogout();
                if (logoutSuccess) {
                    console.log('Logout successful!');
                } else {
                    console.log('Logout failed.');
                }
                break;

            case 'send':
                if (!login.isLoggedIn()) {
                    console.log('Please login first.');
                    return;
                }
                if (parts.length < 2) {
                    console.log('Usage: send <message>');
                    return;
                }
                const messageContent = parts.slice(1).join(' ');
                const response = await client.send({
                    type: 'send',
                    sessionKey: login.getSessionKey(),
                    content: messageContent
                });
                if (response.success) {
                    console.log('Message sent!');
                } else {
                    console.log('Failed to send message:', response.error);
                }
                break;

            case 'messages':
                if (!login.isLoggedIn()) {
                    console.log('Please login first.');
                    return;
                }
                const messagesResponse = await client.send({
                    type: 'messages',
                    sessionKey: login.getSessionKey()
                });
                if (messagesResponse.success) {
                    console.log('Messages:');
                    messagesResponse.messages.forEach(msg => {
                        console.log(`${msg.from}: ${msg.content}`);
                    });
                } else {
                    console.log('Failed to get messages:', messagesResponse.error);
                }
                break;

            case 'help':
                console.log('Available commands:');
                console.log('  login <username> - Login with username');
                console.log('  logout - Logout current user');
                console.log('  send <message> - Send a message');
                console.log('  messages - List all messages');
                console.log('  transfer <recipient> <amount> - Transfer credits to another user');
                console.log('  status - Show current commander status');
                console.log('  help - Show this help');
                console.log('  exit - Exit the program');
                break;

            case 'transfer':
                if (!login.isLoggedIn()) {
                    console.log('Please login first.');
                    return;
                }
                if (parts.length < 3) {
                    console.log('Usage: transfer <recipient> <amount>');
                    return;
                }
                const recipientLogin = parts[1];
                const amount = parseFloat(parts[2]);
                if (isNaN(amount) || amount <= 0) {
                    console.log('Amount must be a positive number.');
                    return;
                }
                try {
                    const response = await client.send({
                        type: 'transfer',
                        sessionKey: login.getSessionKey(),
                        recipientLogin,
                        amount
                    });
                    if (response.type === 'error') {
                        console.log('Transfer failed:', response.error);
                    } else {
                        console.log(response.message);
                        console.log(`Your new balance: ${response.senderBalance} credits`);
                        console.log(`${recipientLogin}'s new balance: ${response.recipientBalance} credits`);
                    }
                } catch (error) {
                    console.log('Transfer failed:', error.message);
                }
                break;

            case 'status':
                if (!login.isLoggedIn()) {
                    console.log('Please login first.');
                    return;
                }
                try {
                    const response = await client.send({
                        type: 'status',
                        sessionKey: login.getSessionKey()
                    });

                    if (response.type === 'status') {
                        console.log(`Login: ${response.login}`);
                        console.log(`Credits: ${response.money}`);
                    } else if (response.type === 'error') {
                        console.log('Status check failed:', response.error);
                    }
                } catch (error) {
                    console.log('Status check failed:', error.message);
                }
                break;

            case 'exit':
                rl.close();
                client.close();
                process.exit(0);
                break;

            default:
                console.log('Unknown command. Type "help" for available commands.');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Prompt for input
function promptUser() {
    const prompt = login.isLoggedIn() ? `${login.getLogin()}> ` : 'guest> ';
    rl.question(prompt, async (command) => {
        await handleCommand(command);
        promptUser();
    });
}

// Start prompting
console.log('Welcome to FlameSteelEmperor client!');
console.log('Type "help" for available commands.');
promptUser();

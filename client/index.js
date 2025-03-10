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

const commandHandlers = {
    async login(args) {
        if (args.length < 2) {
            console.log('Usage: login <username> <passcode>');
            return;
        }

        const username = args[0];
        const passcode = args[1];

        try {
            const success = await login.performLogin(username, passcode);
            if (success) {
                console.log(`Logged in as ${username}`);
            } else {
                console.log('Login failed');
            }
        } catch (error) {
            console.log('Login failed:', error.message);
        }
    },
    async logout() {
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
    },
    async send(args) {
        if (!login.isLoggedIn()) {
            console.log('Please login first.');
            return;
        }
        if (args.length < 1) {
            console.log('Usage: send <message>');
            return;
        }
        const messageContent = args.join(' ');
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
    },
    async messages() {
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
    },
    async help() {
        console.log('Available commands:');
        console.log('  register <username> <passcode>  - Register a new user');
        console.log('  login <username> <passcode>     - Log in to the game');
        console.log('  logout                          - Log out of the game');
        console.log('  status                          - Show your current status');
        console.log('  send <recipient> <amount>       - Send resources to another player');
        console.log('  messages                        - Check your messages');
        console.log('  transfer <recipient> <amount>   - Transfer resources');
        console.log('  buy <item>                      - Buy an item from the shop');
        console.log('  help                            - Show this help menu');
        console.log('  exit                            - Exit the game');
    },
    async transfer(args) {
        if (!login.isLoggedIn()) {
            console.log('Please login first.');
            return;
        }
        if (args.length < 2) {
            console.log('Usage: transfer <recipient> <amount>');
            return;
        }
        const recipientLogin = args[0];
        const amount = parseFloat(args[1]);
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
    },
    async status(args) {
        if (!login.isLoggedIn()) {
            console.log('Please login first.');
            return;
        }

        try {
            const response = await client.send({
                type: 'status',
                sessionKey: login.getSessionKey()
            });

            if (response.type === 'error') {
                console.log('Error:', response.error);
                return;
            }

            // Display commander status
            console.log(`Login: ${response.login}`);
            console.log(`Money: ${response.money} credits`);

            // Display owned objects
            if (response.ownedObjects && response.ownedObjects.length > 0) {
                console.log('\nOwned Objects:');
                response.ownedObjects.forEach(obj => {
                    const priceInfo = obj.price !== undefined 
                        ? ` - Price: ${obj.price} credits` 
                        : '';
                    console.log(`- ${obj.name} (${obj.type})${priceInfo}`);
                });
            } else {
                console.log('\nNo owned objects.');
            }
        } catch (error) {
            console.log('Failed to get status:', error.message);
        }
    },
    async register(args) {
        if (args.length < 2) {
            console.log('Usage: register <username> <passcode>');
            return;
        }

        const username = args[0];
        const passcode = args[1];

        try {
            const response = await client.send({
                type: 'register',
                login: username,
                passcode: passcode
            });

            if (response.type === 'register_response' && response.success) {
                console.log(`Registered user ${username}`);
            } else {
                console.log('Registration failed:', response.error || 'Unknown error');
            }
        } catch (error) {
            console.log('Registration failed:', error.message);
        }
    },
    async exit() {
        rl.close();
        client.close();
        process.exit(0);
    },
    async buy(args) {
        if (!login.isLoggedIn()) {
            console.log('Please login first.');
            return;
        }
        if (args.length < 1) {
            console.log('Usage: buy <itemName>');
            return;
        }

        // Join all arguments as the item name to support multi-word names
        const itemName = args.join(' ');
        
        try {
            const response = await client.send({
                type: 'buy',
                sessionKey: login.getSessionKey(),
                itemName: itemName
            });

            if (response.type === 'error') {
                console.log('Error:', response.error);
            } else {
                console.log(`Successfully bought ${response.itemName} (${response.itemType}) for ${response.price} credits`);
            }
        } catch (error) {
            console.log('Failed to buy item:', error.message);
        }
    }
};

async function handleCommand(command) {
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();

    try {
        if (commandHandlers[cmd]) {
            await commandHandlers[cmd](parts.slice(1));
        } else {
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

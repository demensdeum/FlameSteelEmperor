const TransfersHandler = require('./transfersHandler');
const LoginSessionHandler = require('./loginSessionHandler');

class ClientCommandsHandler {
    static ClientCommandTypes = {
        LOGIN: 'login',
        LOGOUT: 'logout',
        SEND: 'send',
        MESSAGES: 'messages',
        TRANSFER: 'transfer',
        STATUS: 'status',
        REGISTER: 'register',
        BUY: 'buy'
    };

    constructor(universe) {
        this.universe = universe;
        this.transfersHandler = universe.transfersHandler;
        this.loginSessionHandler = universe.loginSessionHandler;

        this.commands = {
            [ClientCommandsHandler.ClientCommandTypes.LOGIN]: this.loginSessionHandler.handleLogin.bind(this.loginSessionHandler),
            [ClientCommandsHandler.ClientCommandTypes.LOGOUT]: this.loginSessionHandler.handleLogout.bind(this.loginSessionHandler),
            [ClientCommandsHandler.ClientCommandTypes.SEND]: this.loginSessionHandler.handleSend.bind(this.loginSessionHandler),
            [ClientCommandsHandler.ClientCommandTypes.MESSAGES]: this.loginSessionHandler.handleMessages.bind(this.loginSessionHandler),
            [ClientCommandsHandler.ClientCommandTypes.TRANSFER]: this.transfersHandler.handleTransfer.bind(this.transfersHandler),
            [ClientCommandsHandler.ClientCommandTypes.STATUS]: this.universe.statusHandler.handleStatus.bind(this.universe.statusHandler),
            [ClientCommandsHandler.ClientCommandTypes.REGISTER]: this.loginSessionHandler.handleRegister.bind(this.loginSessionHandler),
            [ClientCommandsHandler.ClientCommandTypes.BUY]: this.universe.shopHandler.handleBuy.bind(this.universe.shopHandler)
        };
    }

    handle(message) {
        try {
            console.log('ClientCommandsHandler received:', message);
            
            // Validate message type
            if (!message.type) {
                console.log('ClientCommandsHandler: No message type');
                return { type: 'error', error: 'Invalid message format' };
            }

            // Find the appropriate command handler
            const commandHandler = this.commands[message.type];
            if (!commandHandler) {
                console.log(`ClientCommandsHandler: No handler for type ${message.type}`);
                return { type: 'error', error: `Unknown command type: ${message.type}` };
            }

            // Execute the command handler
            console.log(`ClientCommandsHandler: Executing handler for ${message.type}`);
            return commandHandler(message);
        } catch (error) {
            console.error('ClientCommandsHandler error:', error);
            return {
                type: 'error',
                error: error.message || 'Unknown error'
            };
        }
    }
}

module.exports = ClientCommandsHandler;

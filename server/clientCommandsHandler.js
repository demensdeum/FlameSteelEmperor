const TransfersHandler = require('./transfersHandler');

class ClientCommandsHandler {
    static ClientCommandTypes = {
        LOGIN: 'login',
        LOGOUT: 'logout',
        SEND: 'send',
        MESSAGES: 'messages',
        TRANSFER: 'transfer',
        STATUS: 'status',
        REGISTER: 'register'
    };

    constructor(universe) {
        this.universe = universe;
        this.transfers = new TransfersHandler(this.universe.loginSessionHandler);
        this.handlers = {
            [ClientCommandsHandler.ClientCommandTypes.LOGIN]: this.universe.loginSessionHandler.handleLogin.bind(this.universe.loginSessionHandler),
            [ClientCommandsHandler.ClientCommandTypes.LOGOUT]: this.universe.loginSessionHandler.handleLogout.bind(this.universe.loginSessionHandler),
            [ClientCommandsHandler.ClientCommandTypes.SEND]: this.universe.loginSessionHandler.handleSend.bind(this.universe.loginSessionHandler),
            [ClientCommandsHandler.ClientCommandTypes.MESSAGES]: this.universe.loginSessionHandler.handleMessages.bind(this.universe.loginSessionHandler),
            [ClientCommandsHandler.ClientCommandTypes.TRANSFER]: this.transfers.handleTransfer.bind(this.transfers),
            [ClientCommandsHandler.ClientCommandTypes.STATUS]: this.handleStatus.bind(this),
            [ClientCommandsHandler.ClientCommandTypes.REGISTER]: this.universe.loginSessionHandler.handleRegister.bind(this.universe.loginSessionHandler)
        };
    }

    handleStatus(data) {
        console.log('Handling status:', data);
        const { sessionKey } = data;
        
        // Validate session
        if (!this.universe.loginSessionHandler.isValidSession(sessionKey)) {
            return {
                type: 'error',
                error: 'Invalid session'
            };
        }

        // Get commander
        const commander = this.universe.loginSessionHandler.getCommander(sessionKey);
        if (!commander) {
            return {
                type: 'error',
                error: 'Commander not found'
            };
        }

        // Return commander status
        return {
            type: 'status',
            login: commander.getLogin(),
            money: commander.money.get()
        };
    }

    handle(message) {
        try {
            console.log('ClientCommandsHandler received:', message);
            // Message should already be an object at this point
            const data = message;
            console.log('Using data:', data);
            
            if (!data.type || !this.handlers[data.type]) {
                console.log('Invalid message type:', data.type);
                return {
                    type: 'error',
                    error: 'Invalid message type'
                };
            }

            console.log('Calling handler for type:', data.type);
            const result = this.handlers[data.type](data);
            console.log('Handler result:', result);
            return result;
        } catch (error) {
            console.error('Error in handle():', error);
            return {
                type: 'error',
                error: error.message || 'Invalid message format'
            };
        }
    }
}

module.exports = ClientCommandsHandler;

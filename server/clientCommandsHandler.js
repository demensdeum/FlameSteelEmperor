const LoginSessionHandler = require('./loginSessionHandler');

class ClientCommandsHandler {
    static ClientCommandTypes = {
        LOGIN: 'login',
        LOGOUT: 'logout',
        SEND: 'send',
        MESSAGES: 'messages'
    };

    constructor(universe) {
        this.loginSessionHandler = new LoginSessionHandler(universe);
        this.handlers = {
            [ClientCommandsHandler.ClientCommandTypes.LOGIN]: this.loginSessionHandler.handleLogin.bind(this.loginSessionHandler),
            [ClientCommandsHandler.ClientCommandTypes.LOGOUT]: this.loginSessionHandler.handleLogout.bind(this.loginSessionHandler),
            [ClientCommandsHandler.ClientCommandTypes.SEND]: this.loginSessionHandler.handleSend.bind(this.loginSessionHandler),
            [ClientCommandsHandler.ClientCommandTypes.MESSAGES]: this.loginSessionHandler.handleMessages.bind(this.loginSessionHandler)
        };
    }

    handle(message) {
        try {
            const data = JSON.parse(message);
            
            if (!data.type || !this.handlers[data.type]) {
                return {
                    type: 'error',
                    error: 'Invalid message type'
                };
            }

            return this.handlers[data.type](data);
        } catch (error) {
            return {
                type: 'error',
                error: 'Invalid message format'
            };
        }
    }
}

module.exports = ClientCommandsHandler;

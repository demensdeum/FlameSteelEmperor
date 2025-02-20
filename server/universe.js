const ClientCommandsHandler = require('./clientCommandsHandler');
const MessagesHandler = require('./messagesHandler');
const LoginSessionHandler = require('./loginSessionHandler');

class Universe {
    constructor() {
        this.messages = [];
        this.messagesHandler = new MessagesHandler(this);
        this.loginSessionHandler = new LoginSessionHandler(this);
        this.clientCommandsHandler = new ClientCommandsHandler(this);
    }
}

module.exports = Universe;

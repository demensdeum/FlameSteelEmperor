const ClientCommandsHandler = require('./clientCommandsHandler');
const MessagesHandler = require('./messagesHandler');
const LoginSessionHandler = require('./loginSessionHandler');
const Commander = require('./commander');

class Universe {
    constructor() {
        this.messages = [];
        this.commanders = new Map(); // login -> Commander
        this.messagesHandler = new MessagesHandler(this);
        this.loginSessionHandler = new LoginSessionHandler(this);
        this.clientCommandsHandler = new ClientCommandsHandler(this);
    }

    createCommander(login) {
        // Check if commander already exists
        if (this.commanders.has(login)) {
            return this.commanders.get(login);
        }

        // Create new commander with 1000 credits
        const commander = new Commander(login, 1000);
        this.commanders.set(login, commander);
        return commander;
    }

    getCommander(login) {
        return this.commanders.get(login) || null;
    }
}

module.exports = Universe;

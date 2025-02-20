const ClientCommandsHandler = require('./clientCommandsHandler');
const MessagesHandler = require('./messagesHandler');
const LoginSessionHandler = require('./loginSessionHandler');
const TransfersHandler = require('./transfersHandler');
const Shop = require('./shop');
const Commander = require('./commander');
const StatusHandler = require('./statusHandler');
const ShopHandler = require('./shopHandler');

class Universe {
    constructor() {
        this.messages = [];
        this.commanders = new Map(); // login -> Commander
        this.messagesHandler = new MessagesHandler(this);
        this.loginSessionHandler = new LoginSessionHandler(this);
        this.transfersHandler = new TransfersHandler(this);
        this.shop = new Shop();
        this.statusHandler = new StatusHandler(this);
        this.shopHandler = new ShopHandler(this);
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

    getShop() {
        return this.shop;
    }
}

module.exports = Universe;

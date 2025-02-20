const ClientCommandsHandler = require('./clientCommandsHandler');

class Universe {
    constructor() {
        this.commanders = {};
        this.messages = [];
        this.clientCommandsHandler = new ClientCommandsHandler(this);
    }
}

module.exports = Universe;

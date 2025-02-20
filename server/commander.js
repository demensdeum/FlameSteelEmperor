const Resource = require('./resource');

class Commander {
    constructor(login, initialMoney) {
        this.login = login;
        this.money = new Resource(initialMoney);
    }

    getLogin() {
        return this.login;
    }

    setLogin(login) {
        this.login = login;
    }
}

module.exports = Commander;

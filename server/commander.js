class Commander {
    constructor(login) {
        this.login = login;
    }

    getLogin() {
        return this.login;
    }

    setLogin(login) {
        this.login = login;
    }
}

module.exports = Commander;

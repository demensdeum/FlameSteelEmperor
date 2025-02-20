const crypto = require('crypto');

class Login {
    constructor(commander) {
        this.commander = commander;
        this.sessionKey = this.generateSessionKey();
        this.active = true;
    }

    generateSessionKey() {
        return crypto.randomBytes(9).toString('hex');
    }

    getSessionKey() {
        return this.sessionKey;
    }

    getCommander() {
        return this.commander;
    }

    isValidSession() {
        return this.active;
    }

    deactivate() {
        this.active = false;
    }

    matches(sessionKey) {
        return this.sessionKey === sessionKey && this.active;
    }
}

module.exports = Login;

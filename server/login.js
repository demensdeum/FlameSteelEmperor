const crypto = require('crypto');

class Login {
    constructor(commander, passcode = '') {
        this.commander = commander;
        this.passcode = passcode;
        this.regenerateSessionKey();
        this.active = true;
    }

    generateSessionKey() {
        return crypto.randomBytes(9).toString('hex');
    }

    getSessionKey() {
        return this.sessionKey;
    }

    regenerateSessionKey() {
        this.sessionKey = this.generateSessionKey();
        return this.sessionKey;
    }

    getCommander() {
        return this.commander;
    }

    getPasscode() {
        return this.passcode;
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

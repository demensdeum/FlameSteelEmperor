class Commander {
    constructor(login) {
        this.login = login;
        this.sessionKey = this._generateSessionKey();
    }

    _generateSessionKey() {
        // Generate a random session key
        return Math.random().toString(36).substring(2) + 
               Date.now().toString(36);
    }

    getLogin() {
        return this.login;
    }

    getSessionKey() {
        return this.sessionKey;
    }

    setLogin(login) {
        this.login = login;
    }

    setSessionKey(sessionKey) {
        this.sessionKey = sessionKey;
    }

    // Method to validate if the session is active
    isValidSession(sessionKey) {
        return this.sessionKey === sessionKey;
    }
}

module.exports = Commander;

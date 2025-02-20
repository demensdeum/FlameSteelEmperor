class Login {
    constructor(client) {
        this.client = client;
        this.sessionKey = null;
        this.loggedIn = false;
        this.login = null;
    }

    async performLogin(login, passcode) {
        // Require passcode
        if (!passcode) {
            console.error('Passcode is required for login');
            return false;
        }

        const loginCommand = {
            type: 'login',
            login: login,
            passcode: passcode
        };

        try {
            const response = await this.client.send(loginCommand);
            if (response.success) {
                this.sessionKey = response.sessionKey;
                this.loggedIn = true;
                this.login = login;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    }

    async performLogout() {
        if (!this.loggedIn) {
            return true;
        }

        const logoutCommand = {
            type: 'logout',
            sessionKey: this.sessionKey
        };

        try {
            const response = await this.client.send(logoutCommand);
            if (response.success) {
                this.sessionKey = null;
                this.loggedIn = false;
                this.login = null;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Logout failed:', error);
            return false;
        }
    }

    isLoggedIn() {
        return this.loggedIn;
    }

    getSessionKey() {
        return this.sessionKey;
    }

    getLogin() {
        return this.login;
    }

    setLogin(login) {
        this.login = login;
        this.loggedIn = true;
    }

    setSessionKey(sessionKey) {
        this.sessionKey = sessionKey;
    }
}

module.exports = Login;

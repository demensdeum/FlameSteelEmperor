const Commander = require('./commander');
const Login = require('./login');

class LoginSessionHandler {
    constructor(universe) {
        this.universe = universe;
        this.logins = new Map(); // sessionKey -> Login
    }

    login(loginName) {
        const commander = new Commander(loginName);
        const login = new Login(commander);
        const sessionKey = login.getSessionKey();
        this.logins.set(sessionKey, login);
        return sessionKey;
    }

    logout(sessionKey) {
        const login = this.getLogin(sessionKey);
        if (login) {
            login.deactivate();
            this.logins.delete(sessionKey);
            return true;
        }
        return false;
    }

    getLogin(sessionKey) {
        return this.logins.get(sessionKey) || null;
    }

    getCommander(sessionKey) {
        const login = this.getLogin(sessionKey);
        return login ? login.getCommander() : null;
    }

    getAllCommanders() {
        return Array.from(this.logins.values()).map(login => login.getCommander());
    }

    getCommanderByLogin(loginName) {
        return Array.from(this.logins.values())
            .map(login => login.getCommander())
            .find(commander => commander.getLogin() === loginName);
    }

    isValidSession(sessionKey) {
        const login = this.getLogin(sessionKey);
        return login ? login.isValidSession() : false;
    }

    handleLogin(data) {
        if (!data.login) {
            return {
                type: 'error',
                error: 'Login is required'
            };
        }

        const sessionKey = this.login(data.login);
        return {
            type: 'login_response',
            sessionKey: sessionKey,
            success: true
        };
    }

    handleLogout(data) {
        if (!data.sessionKey) {
            return {
                type: 'error',
                error: 'Session key is required'
            };
        }

        const success = this.logout(data.sessionKey);
        return {
            type: 'logout_response',
            success: success
        };
    }

    handleSend(data) {
        if (!data.sessionKey || !data.content) {
            return {
                type: 'error',
                error: 'Session key and content are required'
            };
        }

        const commander = this.getCommander(data.sessionKey);
        if (!commander) {
            return {
                type: 'error',
                error: 'Invalid session key'
            };
        }

        this.universe.messagesHandler.addMessage(commander, data.content);

        return {
            type: 'send_response',
            content: data.content,
            from: commander.getLogin(),
            success: true
        };
    }

    handleMessages(data) {
        if (!data.sessionKey) {
            return {
                type: 'error',
                error: 'Session key is required'
            };
        }

        const commander = this.getCommander(data.sessionKey);
        if (!commander) {
            return {
                type: 'error',
                error: 'Invalid session key'
            };
        }

        const messages = this.universe.messagesHandler.getMessages();
        return {
            type: 'messages_response',
            messages: messages,
            success: true
        };
    }
}

module.exports = LoginSessionHandler;

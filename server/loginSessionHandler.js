const Commander = require('./commander');
class LoginSessionHandler {
    constructor(universe) {
        this.universe = universe;
    }

    login(login) {
        const commander = new Commander(login);
        const sessionKey = commander.getSessionKey();
        this.universe.commanders[sessionKey] = commander;
        return sessionKey;
    }

    logout(sessionKey) {
        if (this.universe.commanders[sessionKey]) {
            delete this.universe.commanders[sessionKey];
            return true;
        }
        return false;
    }

    getCommander(sessionKey) {
        return this.universe.commanders[sessionKey] || null;
    }

    getAllCommanders() {
        return Object.values(this.universe.commanders);
    }

    getCommanderByLogin(login) {
        return Object.values(this.universe.commanders).find(
            commander => commander.getLogin() === login
        );
    }

    isValidSession(sessionKey) {
        return sessionKey in this.universe.commanders;
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

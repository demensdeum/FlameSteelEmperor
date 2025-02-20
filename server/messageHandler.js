const Commander = require('./commander');

class MessageHandler {
    static MessageTypes = {
        LOGIN: 'login',
        LOGOUT: 'logout',
        MESSAGE: 'message'
    };

    constructor(universe) {
        this.universe = universe;
        this.handlers = {
            'login': this.handleLogin.bind(this),
            'logout': this.handleLogout.bind(this),
            'message': this.handleMessage.bind(this)
        };
    }

    handle(message) {
        try {
            const data = JSON.parse(message);
            
            if (!data.type || !this.handlers[data.type]) {
                return {
                    type: 'error',
                    error: 'Invalid message type'
                };
            }

            return this.handlers[data.type](data);
        } catch (error) {
            return {
                type: 'error',
                error: 'Invalid message format'
            };
        }
    }

    handleLogin(data) {
        if (!data.login) {
            return {
                type: 'error',
                error: 'Login is required'
            };
        }

        const commander = new Commander(data.login);
        const sessionKey = commander.getSessionKey();
        this.universe.commanders[sessionKey] = commander;

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

        if (this.universe.commanders[data.sessionKey]) {
            delete this.universe.commanders[data.sessionKey];
            return {
                type: 'logout_response',
                success: true
            };
        }

        return {
            type: 'logout_response',
            success: false
        };
    }

    handleMessage(data) {
        if (!data.sessionKey || !data.content) {
            return {
                type: 'error',
                error: 'Session key and content are required'
            };
        }

        const commander = this.universe.commanders[data.sessionKey];
        if (!commander) {
            return {
                type: 'error',
                error: 'Invalid session key'
            };
        }

        const message = {
            from: commander.getLogin(),
            content: data.content,
            timestamp: Date.now()
        };
        
        this.universe.messages.unshift(message);

        return {
            type: 'message_response',
            content: data.content,
            from: commander.getLogin(),
            success: true
        };
    }

    getMessages(startIndex = 0, count = 50) {
        return this.universe.messages.slice(startIndex, startIndex + count);
    }

    getMessageCount() {
        return this.universe.messages.length;
    }

    clearMessages() {
        this.universe.messages = [];
        return true;
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
}

module.exports = MessageHandler;

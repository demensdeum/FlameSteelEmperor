const Commander = require('./commander');
const Login = require('./login');

class LoginSessionHandler {
    constructor(universe) {
        this.universe = universe;
        this.logins = new Map(); // sessionKey -> Login
        this.registeredUsers = new Map(); // login -> passcode
    }

    login(loginName, passcode) {
        // Require passcode
        if (!passcode) {
            throw new Error('Passcode is required');
        }

        // Check if user exists and passcode matches
        const storedPasscode = this.registeredUsers.get(loginName);
        if (!storedPasscode) {
            throw new Error('User not registered');
        }
        if (storedPasscode !== passcode) {
            throw new Error('Invalid passcode');
        }

        const commander = new Commander(loginName);
        const login = new Login(commander, passcode);
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

    register(loginName, passcode) {
        // Require login and passcode
        if (!loginName) {
            throw new Error('Login is required');
        }
        if (!passcode) {
            throw new Error('Passcode is required');
        }

        // Check if user already exists
        if (this.registeredUsers.has(loginName)) {
            throw new Error('User already exists');
        }

        // Register the user
        this.registeredUsers.set(loginName, passcode);
        return true;
    }

    handleLogin(data) {
        if (!data.login) {
            return {
                type: 'error',
                error: 'Login is required'
            };
        }

        if (!data.passcode) {
            return {
                type: 'error',
                error: 'Passcode is required'
            };
        }

        try {
            const sessionKey = this.login(data.login, data.passcode);
            return {
                type: 'login_response',
                sessionKey: sessionKey,
                success: true
            };
        } catch (error) {
            return {
                type: 'error',
                error: error.message
            };
        }
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

    handleRegister(data) {
        if (!data.login) {
            return {
                type: 'error',
                error: 'Login is required'
            };
        }

        if (!data.passcode) {
            return {
                type: 'error',
                error: 'Passcode is required'
            };
        }

        try {
            this.register(data.login, data.passcode);
            return {
                type: 'register_response',
                success: true
            };
        } catch (error) {
            return {
                type: 'error',
                error: error.message
            };
        }
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

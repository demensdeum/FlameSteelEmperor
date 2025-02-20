const Commander = require('./commander');
const Login = require('./login');

class LoginSessionHandler {
    constructor(universe) {
        this.universe = universe;
        this.logins = new Map(); // sessionKey -> Login
        this.loginsByUsername = new Map(); // username -> Login
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

        // Get or create commander
        const commander = this.universe.getCommander(loginName) || 
                          this.universe.createCommander(loginName);
        
        // Check if an existing login for this username already exists
        let existingLogin = this.loginsByUsername.get(loginName);

        let login;
        let sessionKey;
        if (existingLogin) {
            // Reuse existing login
            login = existingLogin;
            login.active = true;
            
            // Generate a new session key
            sessionKey = login.regenerateSessionKey();
            
            // Remove old session key mapping
            this.logins.delete(login.getSessionKey());
            
            // Update with new session key
            this.logins.set(sessionKey, login);
        } else {
            // Create new login
            login = new Login(commander, passcode);
            sessionKey = login.getSessionKey();
            this.logins.set(sessionKey, login);
            this.loginsByUsername.set(loginName, login);
        }

        return sessionKey;
    }

    logout(sessionKey) {
        const login = this.getLogin(sessionKey);
        if (login) {
            login.deactivate();
            // Remove from both maps
            this.logins.delete(sessionKey);
            this.loginsByUsername.delete(login.commander.getLogin());
            return true;
        }
        return false;
    }

    getLogin(sessionKey) {
        const login = this.logins.get(sessionKey);
        // Only return login if it's active
        return login && login.isValidSession() ? login : null;
    }

    getCommander(sessionKey) {
        const login = this.getLogin(sessionKey);
        return login ? login.commander : null;
    }

    getAllCommanders() {
        return Array.from(this.logins.values()).map(login => login.commander);
    }

    getCommanderByLogin(loginName) {
        return Array.from(this.logins.values())
            .map(login => login.commander)
            .find(commander => commander.getLogin() === loginName);
    }

    isValidSession(sessionKey) {
        const login = this.getLogin(sessionKey);
        return login ? login.isValidSession() : false;
    }

    register(loginName, passcode) {
        // Check if user already exists
        if (this.registeredUsers.has(loginName)) {
            throw new Error('User already registered');
        }

        // Store user credentials
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

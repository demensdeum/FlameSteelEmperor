class StatusHandler {
    constructor(universe) {
        this.universe = universe;
    }

    // Handle status request for a specific commander
    handleStatus(data) {
        // Validate input is an object with sessionKey
        if (!data || typeof data !== 'object' || !data.sessionKey) {
            console.log('StatusHandler: Invalid input, missing sessionKey');
            throw new Error('Invalid status request');
        }

        const sessionKey = data.sessionKey;
        console.log('StatusHandler: Received status request for session key:', sessionKey);

        // Log all current logins
        const allLogins = Array.from(this.universe.loginSessionHandler.logins.entries());
        console.log('StatusHandler: Current active logins:', 
            allLogins.map(([key, login]) => ({
                sessionKey: key, 
                username: login.commander.getLogin(), 
                active: login.isValidSession()
            }))
        );

        // Validate login session
        const loginSession = this.universe.loginSessionHandler.getLogin(sessionKey);
        if (!loginSession) {
            console.log('StatusHandler: No login found for session key');
            throw new Error('Not logged in');
        }

        // Get the commander
        const commander = loginSession.commander;
        console.log('StatusHandler: Commander found:', commander.getLogin());

        // Get owned objects
        const ownedObjects = commander.getOwnedObjects();

        // Prepare status response
        return {
            type: 'status',
            login: commander.getLogin(),
            money: commander.money.get(),
            ownedObjects: ownedObjects.map(obj => {
                const objectInfo = {
                    name: obj.name,
                    type: obj.type
                };
                
                // Only add price if the trait exists
                const price = obj.getTrait('price');
                if (price !== null) {
                    objectInfo.price = price;
                }
                
                return objectInfo;
            })
        };
    }
}

module.exports = StatusHandler;

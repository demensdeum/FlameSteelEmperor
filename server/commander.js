const Resource = require('./resource');
const GameObject = require('./gameObject');
const crypto = require('crypto');

class Commander {
    constructor(login, initialMoney) {
        // Generate a unique ID for the commander
        this.id = crypto.randomBytes(8).toString('hex');
        
        // Type of the object
        this.type = 'commander';
        
        // Name of the commander (same as login)
        this.name = login;
        
        // Timestamp of object creation
        this.createdAt = new Date();

        // Add commander-specific properties
        this.login = login;
        this.money = new Resource(initialMoney);

        // Set of owned game objects
        this.ownedObjects = new Set();

        // Traits map
        this.traits = new Map();

        // Metadata for additional properties
        this.metadata = {};
    }

    getLogin() {
        return this.login;
    }

    setLogin(login) {
        this.login = login;
        // Update name to match new login
        this.name = login;
    }

    // Trait methods
    addTrait(name, value) {
        this.traits.set(name, value);
        return this;
    }

    getTrait(name) {
        return this.traits.get(name) || null;
    }

    // Metadata methods
    setMetadata(key, value) {
        this.metadata[key] = value;
        return this;
    }

    getMetadata(key) {
        return this.metadata[key];
    }

    // Method to add an owned object
    addOwnedObject(gameObject) {
        if (!(gameObject instanceof GameObject)) {
            throw new Error('Can only add GameObject instances');
        }
        this.ownedObjects.add(gameObject);
        
        // Set this commander as the owner of the game object
        gameObject.addOwner(this);
        
        return this;
    }

    // Method to remove an owned object
    removeOwnedObject(gameObject) {
        if (this.ownedObjects.has(gameObject)) {
            this.ownedObjects.delete(gameObject);
            
            // Remove this commander as the owner of the game object
            gameObject.removeOwner(this);
        }
        return this;
    }

    // Method to check if an object is owned
    ownsObject(gameObject) {
        return this.ownedObjects.has(gameObject);
    }

    // Method to get all owned objects
    getOwnedObjects() {
        return Array.from(this.ownedObjects);
    }

    // Method to get owned objects by type
    getOwnedObjectsByType(type) {
        return this.getOwnedObjects().filter(obj => obj.type === type);
    }

    // String representation of the commander
    toString() {
        return `Commander: ${this.name} (ID: ${this.id})`;
    }
}

module.exports = Commander;

const crypto = require('crypto');

class GameObject {
    constructor(type, name) {
        // Generate a unique ID for the game object
        this.id = crypto.randomBytes(8).toString('hex');
        
        // Type of the game object (e.g., 'commander', 'item', 'location')
        this.type = type;
        
        // Name of the game object
        this.name = name;
        
        // Timestamp of object creation
        this.createdAt = new Date();
        
        // Metadata for additional properties
        this.metadata = {};

        // Traits map
        this.traits = new Map();

        // Owners map
        this.owners = new Map();
    }

    // Method to add or update metadata
    setMetadata(key, value) {
        this.metadata[key] = value;
        return this;
    }

    // Method to get metadata
    getMetadata(key) {
        return this.metadata[key];
    }

    // Method to remove metadata
    removeMetadata(key) {
        delete this.metadata[key];
        return this;
    }

    // Method to add a trait
    addTrait(name, value) {
        this.traits.set(name, value);
        return this;
    }

    // Method to get a trait
    getTrait(name) {
        return this.traits.get(name) || null;
    }

    // Method to check if a trait exists
    hasTrait(name) {
        return this.traits.has(name);
    }

    // Method to remove a trait
    removeTrait(name) {
        this.traits.delete(name);
        return this;
    }

    // Method to get all traits as a plain object
    getTraits() {
        return Object.fromEntries(this.traits);
    }

    // Method to set multiple traits at once
    setTraits(traitsObject) {
        Object.entries(traitsObject).forEach(([name, value]) => {
            this.addTrait(name, value);
        });
        return this;
    }

    // Method to add an owner
    addOwner(owner) {
        if (!owner) {
            throw new Error('Owner must be a valid object');
        }
        this.owners.set(owner.id, owner);
        return this;
    }

    // Method to remove an owner
    removeOwner(owner) {
        this.owners.delete(owner.id);
        return this;
    }

    // Method to check if an object has an owner
    hasOwner(owner) {
        return this.owners.has(owner.id);
    }

    // Method to get all owners
    getOwners() {
        return Array.from(this.owners.values());
    }

    // Method to get owners by type
    getOwnersByType(type) {
        return this.getOwners().filter(owner => owner.type === type);
    }

    // Method to get a string representation of the object
    toString() {
        return `${this.type}: ${this.name} (ID: ${this.id})`;
    }

    // Method to check if two game objects are the same
    equals(other) {
        return other instanceof GameObject && this.id === other.id;
    }
}

module.exports = GameObject;

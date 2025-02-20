const GameObject = require('./gameObject');

class Shop {
    constructor() {
        // List of available objects in the shop
        this.items = [];

        // Initialize with Base Building
        const baseBuilding = new GameObject('Base Building', 'building');
        baseBuilding.addTrait('price', 500);
        this.addItem(baseBuilding);
    }

    // Method to add an item to the shop
    addItem(item) {
        // Validate that the item has a price trait
        if (!item.hasTrait('price')) {
            throw new Error('Shop items must have a price trait');
        }
        this.items.push(item);
        return this;
    }

    // Method to remove an item from the shop
    removeItem(item) {
        const index = this.items.findIndex(shopItem => shopItem.id === item.id);
        if (index !== -1) {
            this.items.splice(index, 1);
        }
        return this;
    }

    // Method to get all items
    getItems() {
        return this.items;
    }

    // Method to get items by type
    getItemsByType(type) {
        return this.items.filter(item => item.type === type);
    }

    // Method to find an item by name
    findItemByName(name) {
        return this.items.find(item => item.name === name);
    }

    // Method to buy an item
    buyItem(commander, itemName) {
        const item = this.findItemByName(itemName);
        
        if (!item) {
            throw new Error(`Item ${itemName} not found in shop`);
        }

        const price = item.getTrait('price');
        
        if (!price) {
            throw new Error(`No price set for item ${itemName}`);
        }

        // Check if commander has enough money
        if (commander.money.get() < price) {
            throw new Error('Not enough money to buy the item');
        }

        // Deduct money
        commander.money.spend(price);

        // Add item to commander's owned objects
        commander.addOwnedObject(item);

        return item;
    }
}

module.exports = Shop;

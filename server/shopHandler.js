class ShopHandler {
    constructor(universe) {
        this.universe = universe;
        this.shop = universe.shop;
    }

    // Handle buy request for a specific commander
    handleBuy(data) {
        console.log('ShopHandler: Received buy request', data);

        // Validate login session
        const loginSession = this.universe.loginSessionHandler.getLogin(data.sessionKey);
        if (!loginSession) {
            console.log('ShopHandler: Not logged in');
            throw new Error('Not logged in');
        }

        // Get the commander
        const commander = loginSession.commander;
        console.log('ShopHandler: Commander', commander.getLogin());

        // Validate buy request parameters
        if (!data.itemName) {
            console.log('ShopHandler: Item name is required');
            throw new Error('Item name is required');
        }

        // Log available shop items
        console.log('ShopHandler: Available shop items:', 
            this.shop.getItems().map(item => item.name)
        );

        // Attempt to buy the item
        const item = this.shop.buyItem(commander, data.itemName);

        // Prepare buy response to match client expectations
        return {
            type: 'buy',
            itemName: item.name,
            itemType: item.type,
            price: item.getTrait('price')
        };
    }
}

module.exports = ShopHandler;

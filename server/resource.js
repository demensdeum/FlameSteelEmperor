class Resource {
    constructor(initialAmount = 1000) {
        if (initialAmount < 0) {
            throw new Error('Initial amount cannot be negative');
        }
        this.amount = initialAmount;
    }

    get() {
        return this.amount;
    }

    add(amount) {
        if (amount < 0) {
            throw new Error('Cannot add negative amount');
        }
        this.amount += amount;
        return this.amount;
    }

    spend(amount) {
        if (amount < 0) {
            throw new Error('Cannot spend negative amount');
        }
        if (amount > this.amount) {
            throw new Error('Insufficient funds');
        }
        this.amount -= amount;
        return this.amount;
    }

    transfer(recipient, amount) {
        if (!(recipient instanceof Resource)) {
            throw new Error('Recipient must be a Resource');
        }
        this.spend(amount);
        recipient.add(amount);
        return {
            senderBalance: this.get(),
            recipientBalance: recipient.get()
        };
    }
}

module.exports = Resource;

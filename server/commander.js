class Commander {
    constructor(login) {
        this.login = login;
        this.money = 1000; // Start with 1000 credits
    }

    getLogin() {
        return this.login;
    }

    setLogin(login) {
        this.login = login;
    }

    getMoney() {
        return this.money;
    }

    addMoney(amount) {
        if (amount < 0) {
            throw new Error('Cannot add negative amount');
        }
        this.money += amount;
        return this.money;
    }

    spendMoney(amount) {
        if (amount < 0) {
            throw new Error('Cannot spend negative amount');
        }
        if (amount > this.money) {
            throw new Error('Insufficient funds');
        }
        this.money -= amount;
        return this.money;
    }

    transferMoney(recipient, amount) {
        if (!(recipient instanceof Commander)) {
            throw new Error('Recipient must be a Commander');
        }
        this.spendMoney(amount);
        recipient.addMoney(amount);
        return {
            senderBalance: this.money,
            recipientBalance: recipient.getMoney()
        };
    }
}

module.exports = Commander;

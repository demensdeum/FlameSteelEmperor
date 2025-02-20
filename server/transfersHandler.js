class TransfersHandler {
    constructor(loginSessionHandler) {
        this.loginSessionHandler = loginSessionHandler;
    }

    validateTransfer(sessionKey, recipientLogin, amount) {
        // Validate session
        if (!this.loginSessionHandler.isValidSession(sessionKey)) {
            throw new Error('Invalid session');
        }

        // Get sender commander
        const sender = this.loginSessionHandler.getCommander(sessionKey);
        if (!sender) {
            throw new Error('Sender not found');
        }

        // Get recipient commander
        const recipient = this.loginSessionHandler.getCommanderByLogin(recipientLogin);
        if (!recipient) {
            throw new Error('Recipient not found');
        }

        // Validate amount
        const transferAmount = parseFloat(amount);
        if (isNaN(transferAmount) || transferAmount <= 0) {
            throw new Error('Invalid amount');
        }

        return { sender, recipient, transferAmount };
    }

    performTransfer(sender, recipient, amount) {
        try {
            const result = sender.money.transfer(recipient.money, amount);
            return {
                type: 'transfer',
                message: `Successfully transferred ${amount} credits to ${recipient.getLogin()}`,
                senderBalance: result.senderBalance,
                recipientBalance: result.recipientBalance
            };
        } catch (error) {
            return {
                type: 'error',
                error: error.message
            };
        }
    }

    handleTransfer(data) {
        console.log('Handling transfer:', data);
        const { sessionKey, recipientLogin, amount } = data;

        try {
            const { sender, recipient, transferAmount } = this.validateTransfer(sessionKey, recipientLogin, amount);
            return this.performTransfer(sender, recipient, transferAmount);
        } catch (error) {
            return {
                type: 'error',
                error: error.message
            };
        }
    }
}

module.exports = TransfersHandler;

class MessagesHandler {
    constructor(universe) {
        this.universe = universe;
    }

    addMessage(commander, content) {
        const message = {
            from: commander.getLogin(),
            content: content,
            timestamp: Date.now()
        };
        
        this.universe.messages.unshift(message);
        return true;
    }

    getMessages(startIndex = 0, count = 50) {
        return this.universe.messages.slice(startIndex, startIndex + count);
    }

    getMessageCount() {
        return this.universe.messages.length;
    }

    clearMessages() {
        this.universe.messages = [];
        return true;
    }
}

module.exports = MessagesHandler;

// Version temporaire CommonJS du logger pour les tests
const { format } = require('date-fns');

class Logger {
    constructor(contexte = 'General') {
        this.contexte = contexte;
    }
    
    getTimestamp() {
        return format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    }
    
    formatMessage(niveau, message, data = null) {
        const timestamp = this.getTimestamp();
        let logMessage = `[${timestamp}] [${niveau}] [${this.contexte}] ${message}`;
        
        if (data) {
            if (data instanceof Error) {
                logMessage += `\n${data.stack || data.message}`;
            } else {
                logMessage += `\n${JSON.stringify(data, null, 2)}`;
            }
        }
        
        return logMessage;
    }
    
    debug(message, data = null) {
        console.log(this.formatMessage('DEBUG', message, data));
    }
    
    info(message, data = null) {
        console.log(this.formatMessage('INFO', message, data));
    }
    
    warn(message, data = null) {
        console.log(this.formatMessage('WARN', message, data));
    }
    
    error(message, data = null) {
        console.error(this.formatMessage('ERROR', message, data));
    }
}

// Export par défaut pour CommonJS
module.exports = new Logger('BotDiscord');

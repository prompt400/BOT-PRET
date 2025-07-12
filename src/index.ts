import 'dotenv/config';
import { Bot } from './Bot.js';
import logger from './utils/logger.js';

// Export des modules principaux
export * from './handlers/index.js';
export * from './commands/index.js';
export * from './events/index.js';
export * from './services/index.js';
export * from './middleware/index.js';

// Démarrage du bot
const bot = new Bot();
bot.start().catch(error => {
    logger.error('Erreur fatale:', error);
    process.exit(1);
});

export default Bot;

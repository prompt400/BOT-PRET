import { Client } from 'discord.js';
import logger from '../../utils/logger.js';

export default {
    name: 'error',
    execute: async (client: Client, error: Error): Promise<void> => {
        logger.error('Une erreur est survenue:', error);
    }
};

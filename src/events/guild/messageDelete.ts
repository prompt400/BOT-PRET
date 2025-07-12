import { Message } from 'discord.js';
import logger from '../../utils/logger.js';

export default {
    name: 'messageDelete',
    execute: async (message: Message): Promise<void> => {
        if (message.author?.bot) return;
        
const channel = message.channel;
if ('name' in channel) {
    logger.info(`Message supprimé dans #${channel.name}`);
}
        // TODO: Implémentation à venir
    }
};

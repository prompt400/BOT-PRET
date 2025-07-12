import { Message } from 'discord.js';
import logger from '../../utils/logger.js';

export default {
    name: 'messageDelete',
    execute: async (message: Message): Promise<void> => {
        if (message.author?.bot) return;
        
if (message.channel.type === 'GUILD_TEXT') {
    logger.info(`Message supprimé dans #${message.channel.name}`);
}
        // TODO: Implémentation à venir
    }
};

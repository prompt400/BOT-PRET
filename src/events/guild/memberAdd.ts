import { GuildMember } from 'discord.js';
import logger from '../../utils/logger.js';

export default {
    name: 'guildMemberAdd',
    execute: async (member: GuildMember): Promise<void> => {
        logger.info(`${member.user.tag} a rejoint le serveur ${member.guild.name}`);
        // TODO: Implémentation à venir
    }
};

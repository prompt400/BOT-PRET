import SystemeRolesNSFW from '../services/systemeRolesNSFW.js';
import Logger from '../services/logger.js';

const logger = new Logger('GuildMemberAdd');

export default {
    name: 'guildMemberAdd',
    async execute(member) {
        try {
            logger.info(`Nouveau membre: ${member.user.tag}`);
            
            // Initialiser le système de rôles NSFW
            const systemeRoles = new SystemeRolesNSFW(member.client);
            
            // Envoyer l'interface de sélection des rôles
            await systemeRoles.onNouvelUtilisateur(member);
            
            // Envoyer un message de bienvenue dans le salon général
            const welcomeChannel = member.guild.systemChannel || 
                member.guild.channels.cache.find(ch => ch.name === 'bienvenue' || ch.name === 'welcome');
            
            if (welcomeChannel) {
                await welcomeChannel.send({
                    content: `🔥 Bienvenue ${member} dans notre univers NSFW !\n` +
                            `📨 Regarde tes MP pour choisir ton orientation et débloquer l'accès aux salons exclusifs !`
                });
            }
            
        } catch (erreur) {
            logger.erreur('Erreur lors de l\'accueil du nouveau membre', erreur);
        }
    }
};

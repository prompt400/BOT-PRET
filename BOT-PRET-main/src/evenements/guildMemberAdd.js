import OnboardingService from '../services/onboardingService.js';
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
            
            // Envoyer l'interface de sélection des rôles NSFW
            await systemeRoles.onNouvelUtilisateur(member);
            
            // Démarrer le processus d'onboarding
            const onboardingService = new OnboardingService(member.client);
            await onboardingService.demarrerOnboarding(member);
            
        } catch (erreur) {
            logger.erreur('Erreur lors de l\'accueil du nouveau membre', erreur);
        }
    }
};

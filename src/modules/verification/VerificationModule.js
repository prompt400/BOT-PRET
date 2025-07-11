import { Events } from 'discord.js';
import WelcomeFlow from './welcomeFlow.js';
import PlayfulPersonality from './personalities/PlayfulPersonality.js';

class VerificationModule {
    constructor(client) {
        this.client = client;
        this.welcomeFlow = new WelcomeFlow();
        this.isEnabled = true;
        this.welcomeChannelId = null; // À configurer
        this.verifiedRoleId = null; // À configurer
        
        // Personnalité par défaut
        this.currentPersonality = new PlayfulPersonality();
        
        console.log('✅ Module de vérification initialisé');
    }
    
    /**
     * Initialise les événements du module
     */
    initialize() {
        // Événement quand un membre rejoint le serveur
        this.client.on(Events.GuildMemberAdd, async (member) => {
            if (!this.isEnabled) return;
            
            console.log(`🆕 Nouveau membre: ${member.user.tag}`);
            
            try {
                // Démarrage du flux de bienvenue en DM
                await this.welcomeFlow.startFlow(member, null);
                
            } catch (error) {
                console.error('❌ Erreur lors de l\'accueil du membre:', error);
            }
        });
        
        // Événement pour les interactions (boutons, menus, etc.)
        this.client.on(Events.InteractionCreate, async (interaction) => {
            if (!interaction.isButton() && !interaction.isSelectMenu()) return;
            
            // Traitement des interactions du flux de bienvenue
            if (interaction.customId.startsWith('welcome_')) {
                await this.handleWelcomeInteraction(interaction);
            }
        });
        
        console.log('🎭 Événements du module de vérification configurés');
    }
    
    /**
     * Gère les interactions du flux de bienvenue
     */
    async handleWelcomeInteraction(interaction) {
        const member = interaction.member;
        
        try {
            await this.welcomeFlow.processStep(member, interaction);
        } catch (error) {
            console.error('❌ Erreur dans l\'interaction:', error);
            await interaction.reply({
                content: '😔 Une erreur s\'est produite. Réessaye plus tard...',
                ephemeral: true
            });
        }
    }
    
    /**
     * Configure le module avec les IDs nécessaires
     */
    configure(config) {
        this.welcomeChannelId = config.welcomeChannelId;
        this.verifiedRoleId = config.verifiedRoleId;
        console.log('⚙️ Configuration du module mise à jour');
    }
    
    /**
     * Active ou désactive le module
     */
    toggle(enabled) {
        this.isEnabled = enabled;
        console.log(`🔄 Module de vérification: ${enabled ? 'activé' : 'désactivé'}`);
    }
    
    /**
     * Obtient les statistiques du module
     */
    getStats() {
        return {
            enabled: this.isEnabled,
            activeFlows: this.welcomeFlow.userStates.size,
            totalSteps: this.welcomeFlow.steps.length
        };
    }

    /**
     * Vérifie si un membre est déjà vérifié
     */
    static isVerified(member) {
        return member.roles.cache.some(role => role.name === 'Vérifié');
    }

    /**
     * Démarre manuellement la vérification pour un membre
     */
    static async startVerification(member) {
        const module = member.client.verificationModule;
        if (!module) {
            throw new Error('Module de vérification non initialisé');
        }
        
        // Démarrage du flux en DM
        await module.welcomeFlow.startFlow(member, null);
    }

    /**
     * Récupère les données de vérification d'un utilisateur
     */
    async getUserVerificationData(member) {
        const userState = this.welcomeFlow.userStates.get(member.id);
        const isVerified = member.roles.cache.some(role => role.name === 'Vérifié');
        
        const steps = this.welcomeFlow.steps.map(step => ({
            name: step.name,
            completed: userState?.completedSteps?.includes(step.name) || false
        }));
        
        const assignedRole = member.roles.cache.find(role => 
            ['Soft', 'Playful', 'Dominant'].includes(role.name)
        )?.name;
        
        return {
            isVerified,
            startDate: userState?.startDate || null,
            completedSteps: userState?.completedSteps?.length || 0,
            steps,
            assignedRole
        };
    }

    /**
     * Change la personnalité du bot
     */
    async setPersonality(personalityType) {
        const personalities = {
            'soft': 'SoftPersonality',
            'playful': 'PlayfulPersonality',
            'dominant': 'DominantPersonality'
        };
        
        const modulePath = `./personalities/${personalities[personalityType]}.js`;
        const { default: PersonalityClass } = await import(modulePath);
        this.currentPersonality = new PersonalityClass();
        console.log(`🎭 Personnalité changée en: ${personalityType}`);
    }

    /**
     * Réinitialise la vérification d'un membre
     */
    async resetUserVerification(member) {
        // Supprimer l'état de l'utilisateur
        this.welcomeFlow.userStates.delete(member.id);
        
        // Supprimer le rôle Vérifié
        const verifiedRole = member.guild.roles.cache.find(r => r.name === 'Vérifié');
        if (verifiedRole && member.roles.cache.has(verifiedRole.id)) {
            await member.roles.remove(verifiedRole);
        }
        
        console.log(`🔄 Vérification réinitialisée pour ${member.user.tag}`);
    }

    /**
     * Active l'écoute de l'événement guildMemberAdd
     */
    activateGuildMemberAdd() {
        this.isEnabled = true;
        console.log('✅ Module de vérification activé pour les nouveaux membres');
    }
}

export default VerificationModule;

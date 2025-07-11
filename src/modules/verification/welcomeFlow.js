const { EmbedBuilder, Collection } = require('discord.js');

// Import des personnalités
const SoftPersonality = require('./personalities/SoftPersonality');
const PlayfulPersonality = require('./personalities/PlayfulPersonality');
const DominantPersonality = require('./personalities/DominantPersonality');

// Import des étapes
const LanguageTestStep = require('./steps/LanguageTestStep');
const RulesAcceptanceStep = require('./steps/RulesAcceptanceStep');
const AgeVerificationStep = require('./steps/AgeVerificationStep');
const PersonalityQuizStep = require('./steps/PersonalityQuizStep');

// Import des utilitaires
const CaptchaGenerator = require('./utils/captchaGenerator');
const EmbedAnimator = require('./utils/embedAnimator');

class WelcomeFlow {
    constructor() {
        this.steps = [
            new LanguageTestStep(),
            new RulesAcceptanceStep(),
            new AgeVerificationStep(),
            new PersonalityQuizStep()
        ];
        
        this.personalities = {
            SoftPersonality: new SoftPersonality(),
            PlayfulPersonality: new PlayfulPersonality(),
            DominantPersonality: new DominantPersonality()
        };
        
        this.captchaGenerator = new CaptchaGenerator();
        this.embedAnimator = new EmbedAnimator();
        
        // Collection pour stocker l'état des utilisateurs
        this.userStates = new Collection();
    }
    
    async startFlow(member, channel) {
        console.log(`🎭 Démarrage du flux de bienvenue pour ${member.user.tag}`);
        
        // Initialisation de l'état utilisateur
        this.userStates.set(member.id, {
            currentStep: 0,
            personality: null,
            completed: false,
            completedSteps: [],
            startTime: new Date(),
            startDate: new Date().toISOString()
        });
        
        try {
            // Créer le DM avec l'utilisateur
            const dmChannel = await member.createDM();
            
            // Message de bienvenue initial
            const welcomeEmbed = this.embedAnimator.createCinematicEmbed(
                '🔥 Bienvenue dans l\'Enfer du Plaisir 🔥',
                `Salut ${member} ! 😏\n\n` +
                `Tu viens d'entrer dans un monde où tes fantasmes prennent vie... 🌶️\n\n` +
                `Mais avant de pouvoir explorer nos salons torrides, tu dois prouver que tu es digne ! 😈\n\n` +
                `**Es-tu prêt(e) à relever le défi ?** 🔥`,
                '#FF1493'
            );
            
            const startButton = this.embedAnimator.createSexyButtons('playful');
            
            const welcomeMessage = await dmChannel.send({
                embeds: [welcomeEmbed],
                components: [startButton]
            });
            
            // Animation du message de bienvenue
            await this.embedAnimator.animateEmbed(welcomeMessage, 'fire', 3000);
            
            console.log(`✅ Message de bienvenue envoyé en DM à ${member.user.tag}`);
            
            return welcomeMessage;
        } catch (error) {
            console.error(`❌ Impossible d'envoyer un DM à ${member.user.tag}:`, error);
            throw error;
        }
    }
    
    async processStep(member, interaction) {
        const userState = this.userStates.get(member.id);
        if (!userState) return;
        
        const currentStep = this.steps[userState.currentStep];
        const personality = userState.personality || this.personalities.PlayfulPersonality;
        
        try {
            // Exécution de l'étape actuelle
            const result = await currentStep.execute(interaction, personality);
            
            // Création de l'embed pour l'étape
            const stepEmbed = this.createStepEmbed(currentStep, result, userState);
            
            await interaction.reply({
                embeds: [stepEmbed],
                ephemeral: true
            });
            
            // Mise à jour de l'état
            userState.currentStep++;
            userState.completedSteps.push(currentStep.name);
            
            // Attribution de 10 KissCoins par étape
            await this.addKissCoins(member, 10);
            
            if (userState.currentStep >= this.steps.length) {
                await this.completeFlow(member, interaction);
            }
            
        } catch (error) {
            console.error(`Erreur dans l'étape ${currentStep.name}:`, error);
            await interaction.reply({
                content: `${personality.getMessage('error')}`,
                ephemeral: true
            });
        }
    }
    
    createStepEmbed(step, result, userState) {
        const progressBar = this.embedAnimator.createProgressBar(
            userState.currentStep + 1,
            this.steps.length,
            'fire'
        );
        
        const embed = new EmbedBuilder()
            .setTitle(`${step.emoji} ${step.name}`)
            .setDescription(result.description || 'Complète cette étape pour continuer...')
            .addFields({
                name: 'Progression',
                value: progressBar,
                inline: false
            })
            .setColor('#FF69B4')
            .setFooter({
                text: `Étape ${userState.currentStep + 1}/${this.steps.length}`
            });
            
        return embed;
    }
    
    async completeFlow(member, interaction) {
        const userState = this.userStates.get(member.id);
        userState.completed = true;
        
        // Attribution de la personnalité finale
        const finalPersonality = userState.personality || this.personalities.PlayfulPersonality;
        
        const completionEmbed = this.embedAnimator.createCinematicEmbed(
            '🎉 Félicitations ! Tu es des nôtres ! 🎉',
            `${finalPersonality.getMessage('success')}\n\n` +
            `Tu as maintenant accès à tous nos salons secrets... 😈\n` +
            `Prépare-toi à vivre des moments inoubliables ! 🔥\n\n` +
            `**Ta personnalité assignée :** ${finalPersonality.style} ${finalPersonality.getRandomEmoji()}`,
            '#00FF00',
            finalPersonality.style
        );
        
        await interaction.followUp({
            embeds: [completionEmbed],
            ephemeral: false
        });
        
        // Attribution des rôles Discord
        await this.assignRoles(member, finalPersonality);
        
        // Nettoyage de l'état
        this.userStates.delete(member.id);
    }
    
    async assignRoles(member, personality) {
        try {
            // Attribution du rôle Vérifié
            const verifiedRole = member.guild.roles.cache.find(r => r.name === 'Vérifié');
            if (verifiedRole) {
                await member.roles.add(verifiedRole);
            }
            
            // Attribution du rôle selon la personnalité
            const personalityRoles = {
                'douce': 'Soft',
                'taquine': 'Playful',
                'autoritaire': 'Dominant'
            };
            
            const roleName = personalityRoles[personality.style];
            if (roleName) {
                const role = member.guild.roles.cache.find(r => r.name === roleName);
                if (role) {
                    await member.roles.add(role);
                    console.log(`✅ Rôle ${roleName} attribué à ${member.user.tag}`);
                }
            }
            
            // Attribution du badge "Nouveau Libertin"
            const libertinRole = member.guild.roles.cache.find(r => r.name === 'Nouveau Libertin');
            if (libertinRole) {
                await member.roles.add(libertinRole);
                console.log(`🎭 Badge "Nouveau Libertin" attribué à ${member.user.tag}`);
            }
            
            // Suppression du rôle Non vérifié
            const unverifiedRole = member.guild.roles.cache.find(r => r.name === 'Non vérifié');
            if (unverifiedRole && member.roles.cache.has(unverifiedRole.id)) {
                await member.roles.remove(unverifiedRole);
            }
            
        } catch (error) {
            console.error('Erreur lors de l\'attribution des rôles:', error);
        }
    }
    
    async addKissCoins(member, amount) {
        // TODO: Implémenter l'ajout de KissCoins dans la base de données
        console.log(`💰 +${amount} KissCoins pour ${member.user.tag}`);
    }
}

module.exports = WelcomeFlow;

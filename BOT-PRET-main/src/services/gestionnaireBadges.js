import Logger from './logger.js';
import { EmbedBuilder } from 'discord.js';

const logger = new Logger('GestionnaireBadges');

/**
 * Gestionnaire des badges et récompenses du système NSFW
 */
class GestionnaireBadges {
    constructor() {
        // Stockage des badges des utilisateurs
        this.badgesUtilisateurs = new Map();
        
        // Définition des badges disponibles
        this.badges = {
            // Badges d'orientation
            'esprit_libre': {
                nom: 'Esprit Libre',
                description: 'A choisi l\'orientation Libido Libre',
                emoji: '🔥',
                rare: false
            },
            'double_attirance': {
                nom: 'Double Attirance',
                description: 'A choisi l\'orientation Féroce Bi',
                emoji: '💜',
                rare: false
            },
            'classique_passion': {
                nom: 'Passion Classique',
                description: 'A choisi l\'orientation Insatiable Hétéro',
                emoji: '❤️',
                rare: false
            },
            'explorateur': {
                nom: 'Explorateur',
                description: 'A choisi l\'orientation Créature Curieuse',
                emoji: '🌈',
                rare: false
            },
            'arc_en_ciel': {
                nom: 'Arc-en-ciel',
                description: 'A choisi l\'orientation Légende du Rainbow',
                emoji: '🏳️‍🌈',
                rare: false
            },
            'mysterieux': {
                nom: 'Mystérieux',
                description: 'A choisi l\'orientation Explorateur de l\'Ombre',
                emoji: '🌑',
                rare: true
            },
            
            // Badges de progression
            'veteran_hot': {
                nom: 'Vétéran Hot',
                description: 'A envoyé 100 messages dans les discussions hot',
                emoji: '🔥',
                rare: true
            },
            'sans_tabou': {
                nom: 'Sans Tabou',
                description: 'A partagé 10 anecdotes interdites validées',
                emoji: '🚫',
                rare: true
            },
            'briseur_certifie': {
                nom: 'Briseur Certifié',
                description: 'Performance légendaire reconnue',
                emoji: '🛏️',
                rare: true
            },
            'seducteur_pro': {
                nom: 'Séducteur Pro',
                description: 'Maître de la séduction',
                emoji: '😘',
                rare: false
            },
            
            // Badges spéciaux
            'cocu_badge': {
                nom: 'Cocu du Jour',
                description: 'A été élu Cocu du Jour',
                emoji: '🤡',
                rare: false,
                temporaire: true
            },
            'bombe': {
                nom: 'Bombe de la Semaine',
                description: 'A été élu.e Bombe de la Semaine',
                emoji: '💣',
                rare: true,
                temporaire: true
            },
            
            // Badges de collection
            'collectionneur_novice': {
                nom: 'Collectionneur Novice',
                description: 'A collecté 5 badges différents',
                emoji: '🌟',
                rare: false
            },
            'collectionneur_expert': {
                nom: 'Collectionneur Expert',
                description: 'A collecté 15 badges différents',
                emoji: '⭐',
                rare: true
            },
            'collectionneur_legendaire': {
                nom: 'Collectionneur Légendaire',
                description: 'A collecté 30 badges différents',
                emoji: '💫',
                rare: true,
                legendaire: true
            }
        };
    }

    /**
     * Attribue un badge à un utilisateur
     */
    async attribuerBadge(userId, badgeId) {
        try {
            if (!this.badges[badgeId]) {
                logger.avertissement(`Badge inexistant: ${badgeId}`);
                return false;
            }

            const userBadges = this.badgesUtilisateurs.get(userId) || [];
            
            // Vérifier si l'utilisateur a déjà ce badge
            if (userBadges.some(b => b.id === badgeId)) {
                logger.debug(`L'utilisateur ${userId} a déjà le badge ${badgeId}`);
                return false;
            }

            // Ajouter le badge
            userBadges.push({
                id: badgeId,
                obtenuLe: new Date(),
                ...this.badges[badgeId]
            });

            this.badgesUtilisateurs.set(userId, userBadges);
            
            // Vérifier les badges de collection
            await this.verifierBadgesCollection(userId);
            
            logger.info(`Badge ${badgeId} attribué à ${userId}`);
            return true;
        } catch (erreur) {
            logger.erreur(`Erreur lors de l'attribution du badge ${badgeId}`, erreur);
            return false;
        }
    }

    /**
     * Retire un badge temporaire
     */
    async retirerBadgeTemporaire(userId, badgeId) {
        const userBadges = this.badgesUtilisateurs.get(userId) || [];
        const nouveauxBadges = userBadges.filter(b => b.id !== badgeId);
        this.badgesUtilisateurs.set(userId, nouveauxBadges);
        logger.info(`Badge temporaire ${badgeId} retiré de ${userId}`);
    }

    /**
     * Vérifie et attribue les badges de collection
     */
    async verifierBadgesCollection(userId) {
        const userBadges = this.badgesUtilisateurs.get(userId) || [];
        const nombreBadges = userBadges.filter(b => !b.temporaire).length;

        if (nombreBadges >= 30 && !userBadges.some(b => b.id === 'collectionneur_legendaire')) {
            await this.attribuerBadge(userId, 'collectionneur_legendaire');
        } else if (nombreBadges >= 15 && !userBadges.some(b => b.id === 'collectionneur_expert')) {
            await this.attribuerBadge(userId, 'collectionneur_expert');
        } else if (nombreBadges >= 5 && !userBadges.some(b => b.id === 'collectionneur_novice')) {
            await this.attribuerBadge(userId, 'collectionneur_novice');
        }
    }

    /**
     * Obtient tous les badges d'un utilisateur
     */
    getBadgesUtilisateur(userId) {
        return this.badgesUtilisateurs.get(userId) || [];
    }

    /**
     * Crée un embed affichant les badges d'un utilisateur
     */
    creerEmbedBadges(user) {
        const userBadges = this.getBadgesUtilisateur(user.id);
        
        const embed = new EmbedBuilder()
            .setTitle(`🏅 Badges de ${user.username}`)
            .setColor('#FFD700')
            .setThumbnail(user.displayAvatarURL());

        if (userBadges.length === 0) {
            embed.setDescription('Aucun badge obtenu pour le moment.');
        } else {
            // Grouper les badges par rareté
            const badgesNormaux = userBadges.filter(b => !b.rare && !b.legendaire);
            const badgesRares = userBadges.filter(b => b.rare && !b.legendaire);
            const badgesLegendaires = userBadges.filter(b => b.legendaire);

            let description = '';

            if (badgesLegendaires.length > 0) {
                description += '**💫 LÉGENDAIRES**\n';
                badgesLegendaires.forEach(b => {
                    description += `${b.emoji} **${b.nom}** - ${b.description}\n`;
                });
                description += '\n';
            }

            if (badgesRares.length > 0) {
                description += '**⭐ RARES**\n';
                badgesRares.forEach(b => {
                    description += `${b.emoji} **${b.nom}** - ${b.description}\n`;
                });
                description += '\n';
            }

            if (badgesNormaux.length > 0) {
                description += '**🌟 NORMAUX**\n';
                badgesNormaux.forEach(b => {
                    description += `${b.emoji} **${b.nom}** - ${b.description}\n`;
                });
            }

            embed.setDescription(description);
            embed.setFooter({ 
                text: `Total: ${userBadges.length} badges | ${badgesRares.length + badgesLegendaires.length} rares` 
            });
        }

        return embed;
    }

    /**
     * Obtient la liste de tous les badges disponibles
     */
    getTousBadges() {
        return Object.entries(this.badges).map(([id, badge]) => ({
            id,
            ...badge
        }));
    }

    /**
     * Vérifie les conditions pour un badge automatique
     */
    async verifierConditionBadge(userId, type, valeur) {
        switch(type) {
            case 'messages_hot':
                if (valeur >= 100) {
                    await this.attribuerBadge(userId, 'veteran_hot');
                }
                break;
            case 'anecdotes_validees':
                if (valeur >= 10) {
                    await this.attribuerBadge(userId, 'sans_tabou');
                }
                break;
            // Ajouter d'autres conditions selon les besoins
        }
    }
}

export default new GestionnaireBadges();

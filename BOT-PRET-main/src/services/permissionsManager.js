import { PermissionsBitField } from 'discord.js';
import { ROLES_CONFIG, SALONS_ROLES } from '../config/rolesNSFW.js';
import logger from '../utils/logger.js';
import { utilisateursDB } from '../services/databaseService.js';

/**
 * Gestionnaire des permissions progressives
 * Gère l'accès aux salons selon orientation, réputation, progression, badges et événements
 */
export class PermissionsManager {
    constructor(client) {
        this.client = client;
        this.matricePermissions = new Map();
        this.rolesTemporaires = new Map();
        this.conditionsCache = new Map();
        
        // Initialiser la matrice au démarrage
        this.initialiserMatricePermissions();
    }

    /**
     * Initialise la matrice des permissions
     */
    initialiserMatricePermissions() {
        // Structure de la matrice : salon -> { roles: [], conditions: [], niveaux: {} }
        for (const [salonId, salonConfig] of Object.entries(SALONS_ROLES)) {
            this.matricePermissions.set(salonId, {
                nom: salonConfig.nom,
                description: salonConfig.description,
                nsfw: salonConfig.nsfw,
                roles: salonConfig.roles_requis || [],
                conditions: this.genererConditionsSalon(salonId, salonConfig),
                niveaux: this.genererNiveauxAcces(salonConfig),
                temporaire: salonConfig.temporaire || false,
                cache: salonConfig.cache || false,
                verificationsSpeciales: this.genererVerificationsSpeciales(salonConfig)
            });
        }
        
        logger.info(`Matrice des permissions initialisée avec ${this.matricePermissions.size} salons`);
    }

    /**
     * Génère les conditions d'accès pour un salon
     */
    genererConditionsSalon(salonId, config) {
        const conditions = [];

        // Condition de base : rôles requis
        if (config.roles_requis && config.roles_requis.length > 0) {
            conditions.push({
                type: 'roles',
                operation: 'OR', // Au moins un des rôles
                roles: config.roles_requis,
                message: `Nécessite un des rôles : ${config.roles_requis.join(', ')}`
            });
        }

        // Condition d'âge vérifié
        if (config.verification_age) {
            conditions.push({
                type: 'age_verifie',
                valeur: true,
                message: 'Vérification d\'âge requise'
            });
        }

        // Condition de niveau de confiance
        if (salonId.includes('vip') || salonId.includes('prive')) {
            conditions.push({
                type: 'niveau_confiance',
                minimum: 3,
                message: 'Niveau de confiance 3+ requis'
            });
        }

        // Condition d'énigme
        if (config.enigme_acces) {
            conditions.push({
                type: 'enigme_resolue',
                enigme: `enigme_${salonId}`,
                message: 'Résoudre l\'énigme d\'accès'
            });
        }

        // Condition de progression
        if (salonId.includes('godx')) {
            conditions.push({
                type: 'progression',
                role: 'godxplorer',
                niveau_minimum: this.determinerNiveauMinimum(salonId),
                message: 'Niveau GodXPlorer requis'
            });
        }

        return conditions;
    }

    /**
     * Génère les niveaux d'accès progressifs
     */
    genererNiveauxAcces(config) {
        const niveaux = {
            visiteur: {
                permissions: ['ViewChannel'],
                conditions: []
            },
            participant: {
                permissions: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                conditions: ['messages_minimum']
            },
            actif: {
                permissions: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'AttachFiles', 'EmbedLinks'],
                conditions: ['reputation_positive', 'anciennete']
            },
            vip: {
                permissions: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'AttachFiles', 'EmbedLinks', 'UseExternalEmojis', 'AddReactions'],
                conditions: ['badges_speciaux', 'contributions']
            }
        };

        // Personnaliser selon le type de salon
        if (config.nsfw) {
            niveaux.visiteur.conditions.push('age_verifie');
        }

        if (config.cache) {
            niveaux.visiteur.conditions.push('enigme_decouverte');
        }

        return niveaux;
    }

    /**
     * Génère les vérifications spéciales
     */
    genererVerificationsSpeciales(config) {
        const verifications = [];

        if (config.anonyme) {
            verifications.push('mode_anonyme');
        }

        if (config.temporaire) {
            verifications.push('acces_temporaire');
        }

        if (config.election) {
            verifications.push('vote_communautaire');
        }

        return verifications;
    }

    /**
     * Vérifie si un utilisateur peut accéder à un salon
     */
    async peutAccederSalon(userId, salonId, guild) {
        try {
            const membre = await guild.members.fetch(userId);
            const salonPermissions = this.matricePermissions.get(salonId);
            
            if (!salonPermissions) {
                logger.avertissement(`Salon ${salonId} non trouvé dans la matrice`);
                return { acces: false, raison: 'Salon non configuré' };
            }

            // Vérifier toutes les conditions
            for (const condition of salonPermissions.conditions) {
                const resultat = await this.verifierCondition(membre, condition);
                if (!resultat.valide) {
                    return { acces: false, raison: resultat.raison };
                }
            }

            // Vérifier les permissions spéciales
            for (const verification of salonPermissions.verificationsSpeciales) {
                const resultat = await this.verifierSpeciale(membre, verification);
                if (!resultat.valide) {
                    return { acces: false, raison: resultat.raison };
                }
            }

            return { acces: true, niveau: await this.determinerNiveauAcces(membre, salonId) };
            
        } catch (erreur) {
            logger.erreur('Erreur lors de la vérification d\'accès', erreur);
            return { acces: false, raison: 'Erreur de vérification' };
        }
    }

    /**
     * Vérifie une condition spécifique
     */
    async verifierCondition(membre, condition) {
        switch (condition.type) {
            case 'roles':
                return this.verifierRoles(membre, condition);
            
            case 'age_verifie':
                return this.verifierAge(membre);
            
            case 'niveau_confiance':
                return this.verifierNiveauConfiance(membre, condition.minimum);
            
            case 'enigme_resolue':
                return this.verifierEnigme(membre, condition.enigme);
            
            case 'progression':
                return this.verifierProgression(membre, condition);
            
            default:
                return { valide: true };
        }
    }

    /**
     * Vérifie les rôles d'un membre
     */
    verifierRoles(membre, condition) {
        const possedeRole = condition.roles.some(roleId => {
            const roleConfig = this.trouverRoleConfig(roleId);
            if (!roleConfig) return false;
            return membre.roles.cache.some(r => r.name === roleConfig.nom);
        });

        return {
            valide: possedeRole,
            raison: possedeRole ? null : condition.message
        };
    }

    /**
     * Vérifie l'âge d'un utilisateur
     */
    async verifierAge(membre) {
        const userData = await utilisateursDB.obtenirUtilisateur(membre.id);
        return {
            valide: userData?.ageVerifie === true,
            raison: 'Vérification d\'âge requise (18+)'
        };
    }

    /**
     * Vérifie le niveau de confiance
     */
    async verifierNiveauConfiance(membre, minimum) {
        const userData = await utilisateursDB.obtenirUtilisateur(membre.id);
        const niveau = userData?.niveauConfiance || 0;
        
        return {
            valide: niveau >= minimum,
            raison: `Niveau de confiance ${minimum}+ requis (actuel: ${niveau})`
        };
    }

    /**
     * Vérifie si une énigme est résolue
     */
    async verifierEnigme(membre, enigmeId) {
        const userData = await utilisateursDB.obtenirUtilisateur(membre.id);
        const enigmesResolues = userData?.enigmesResolues || [];
        
        return {
            valide: enigmesResolues.includes(enigmeId),
            raison: 'Énigme d\'accès non résolue'
        };
    }

    /**
     * Vérifie la progression d'un utilisateur
     */
    async verifierProgression(membre, condition) {
        const userData = await utilisateursDB.obtenirUtilisateur(membre.id);
        const progression = userData?.progressions?.[condition.role] || { niveau: 0 };
        
        return {
            valide: progression.niveau >= condition.niveau_minimum,
            raison: `Niveau ${condition.niveau_minimum} ${condition.role} requis (actuel: ${progression.niveau})`
        };
    }

    /**
     * Vérifie une condition spéciale
     */
    async verifierSpeciale(membre, verification) {
        switch (verification) {
            case 'mode_anonyme':
                return { valide: true }; // Toujours autorisé pour l'anonymat
            
            case 'acces_temporaire':
                return this.verifierAccesTemporaire(membre);
            
            case 'vote_communautaire':
                return this.verifierVoteCommunautaire(membre);
            
            default:
                return { valide: true };
        }
    }

    /**
     * Vérifie l'accès temporaire
     */
    async verifierAccesTemporaire(membre) {
        const roleTemporaire = this.rolesTemporaires.get(membre.id);
        if (!roleTemporaire) {
            return { valide: false, raison: 'Aucun accès temporaire actif' };
        }

        if (Date.now() > roleTemporaire.expiration) {
            this.rolesTemporaires.delete(membre.id);
            return { valide: false, raison: 'Accès temporaire expiré' };
        }

        return { valide: true };
    }

    /**
     * Vérifie le vote communautaire
     */
    async verifierVoteCommunautaire(membre) {
        // Vérifier si le membre a été élu pour un rôle spécial
        const userData = await utilisateursDB.obtenirUtilisateur(membre.id);
        const elections = userData?.elections || [];
        
        return {
            valide: elections.some(e => e.actif && e.type === 'bombe_semaine'),
            raison: 'Non élu par la communauté'
        };
    }

    /**
     * Détermine le niveau d'accès d'un membre
     */
    async determinerNiveauAcces(membre, salonId) {
        const userData = await utilisateursDB.obtenirUtilisateur(membre.id);
        const salonConfig = this.matricePermissions.get(salonId);
        
        // Calcul du score d'accès
        let score = 0;
        
        // Points pour l'ancienneté
        const joursAnciennete = Math.floor((Date.now() - membre.joinedTimestamp) / (1000 * 60 * 60 * 24));
        score += Math.min(joursAnciennete / 10, 10); // Max 10 points
        
        // Points pour les messages
        score += Math.min((userData?.stats?.messages || 0) / 100, 20); // Max 20 points
        
        // Points pour la réputation
        score += Math.min((userData?.reputation || 0), 30); // Max 30 points
        
        // Points pour les badges
        score += (userData?.badges || []).length * 5; // 5 points par badge
        
        // Points pour les contributions
        score += (userData?.contributions || 0) * 2;
        
        // Déterminer le niveau
        if (score >= 100) return 'vip';
        if (score >= 50) return 'actif';
        if (score >= 20) return 'participant';
        return 'visiteur';
    }

    /**
     * Attribue un rôle temporaire
     */
    async attribuerRoleTemporaire(userId, roleId, duree, raison) {
        try {
            const guild = this.client.guilds.cache.first();
            const membre = await guild.members.fetch(userId);
            const roleConfig = this.trouverRoleConfig(roleId);
            
            if (!roleConfig) {
                throw new Error(`Configuration du rôle ${roleId} introuvable`);
            }

            const role = guild.roles.cache.find(r => r.name === roleConfig.nom);
            if (!role) {
                throw new Error(`Rôle Discord ${roleConfig.nom} introuvable`);
            }

            // Ajouter le rôle
            await membre.roles.add(role, raison);
            
            // Enregistrer l'expiration
            const expiration = Date.now() + duree;
            this.rolesTemporaires.set(userId, {
                roleId,
                expiration,
                raison
            });

            // Programmer la suppression
            setTimeout(async () => {
                await this.retirerRoleTemporaire(userId, roleId);
            }, duree);

            logger.info(`Rôle temporaire ${roleConfig.nom} attribué à ${membre.user.tag} pour ${duree}ms`);
            
            return {
                succes: true,
                role: roleConfig.nom,
                expiration: new Date(expiration)
            };

        } catch (erreur) {
            logger.erreur('Erreur lors de l\'attribution du rôle temporaire', erreur);
            return {
                succes: false,
                erreur: erreur.message
            };
        }
    }

    /**
     * Retire un rôle temporaire
     */
    async retirerRoleTemporaire(userId, roleId) {
        try {
            const guild = this.client.guilds.cache.first();
            const membre = await guild.members.fetch(userId);
            const roleConfig = this.trouverRoleConfig(roleId);
            
            if (!roleConfig) return;

            const role = guild.roles.cache.find(r => r.name === roleConfig.nom);
            if (!role) return;

            await membre.roles.remove(role, 'Expiration du rôle temporaire');
            this.rolesTemporaires.delete(userId);
            
            logger.info(`Rôle temporaire ${roleConfig.nom} retiré de ${membre.user.tag}`);

        } catch (erreur) {
            logger.erreur('Erreur lors du retrait du rôle temporaire', erreur);
        }
    }

    /**
     * Met à jour les permissions d'un salon
     */
    async mettreAJourPermissionsSalon(salonId, guild) {
        try {
            const salonConfig = this.matricePermissions.get(salonId);
            if (!salonConfig) return;

            const salon = guild.channels.cache.find(c => c.name === salonConfig.nom);
            if (!salon) return;

            // Réinitialiser les permissions
            const permissions = [{
                id: guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel]
            }];

            // Ajouter les permissions pour chaque rôle requis
            for (const roleId of salonConfig.roles) {
                const roleConfig = this.trouverRoleConfig(roleId);
                if (!roleConfig) continue;

                const role = guild.roles.cache.find(r => r.name === roleConfig.nom);
                if (!role) continue;

                permissions.push({
                    id: role.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory
                    ]
                });
            }

            // Appliquer les permissions
            await salon.permissionOverwrites.set(permissions);
            
            logger.info(`Permissions mises à jour pour le salon ${salonConfig.nom}`);

        } catch (erreur) {
            logger.erreur('Erreur lors de la mise à jour des permissions', erreur);
        }
    }

    /**
     * Trouve la configuration d'un rôle par son ID
     */
    trouverRoleConfig(roleId) {
        for (const categorie of Object.values(ROLES_CONFIG)) {
            if (categorie[roleId]) {
                return categorie[roleId];
            }
        }
        return null;
    }

    /**
     * Détermine le niveau minimum requis pour un salon
     */
    determinerNiveauMinimum(salonId) {
        if (salonId.includes('vip')) return 50;
        if (salonId.includes('2')) return 25;
        if (salonId.includes('1')) return 10;
        return 1;
    }

    /**
     * Génère un rapport des permissions pour un utilisateur
     */
    async genererRapportPermissions(userId, guild) {
        const membre = await guild.members.fetch(userId);
        const rapport = {
            utilisateur: {
                id: userId,
                tag: membre.user.tag,
                roles: membre.roles.cache.map(r => r.name)
            },
            salons: []
        };

        for (const [salonId, config] of this.matricePermissions) {
            const acces = await this.peutAccederSalon(userId, salonId, guild);
            rapport.salons.push({
                id: salonId,
                nom: config.nom,
                acces: acces.acces,
                niveau: acces.niveau || 'aucun',
                raison: acces.raison || 'Accès autorisé'
            });
        }

        return rapport;
    }

    /**
     * Vérifie et met à jour les rôles expirés
     */
    async verifierRolesExpires() {
        const maintenant = Date.now();
        
        for (const [userId, roleData] of this.rolesTemporaires) {
            if (maintenant > roleData.expiration) {
                await this.retirerRoleTemporaire(userId, roleData.roleId);
            }
        }
    }

    /**
     * Applique un bonus de permission temporaire
     */
    async appliquerBonusTemporaire(userId, typeBonus, duree) {
        const bonusConfig = {
            'acces_vip': {
                salons: ['salon-vip', 'vip-lounge'],
                permissions: ['vip_temporaire'],
                duree: duree || 86400000 // 24h par défaut
            },
            'explorateur': {
                salons: ['salon-mystere', 'salon-ombre'],
                permissions: ['exploration_temporaire'],
                duree: duree || 3600000 // 1h par défaut
            },
            'createur': {
                salons: ['atelier-creation'],
                permissions: ['creation_temporaire'],
                duree: duree || 604800000 // 7 jours par défaut
            }
        };

        const bonus = bonusConfig[typeBonus];
        if (!bonus) return { succes: false, erreur: 'Type de bonus inconnu' };

        // Enregistrer le bonus
        this.rolesTemporaires.set(`${userId}_bonus_${typeBonus}`, {
            type: 'bonus',
            typeBonus,
            salons: bonus.salons,
            permissions: bonus.permissions,
            expiration: Date.now() + bonus.duree
        });

        // Programmer la suppression
        setTimeout(() => {
            this.rolesTemporaires.delete(`${userId}_bonus_${typeBonus}`);
        }, bonus.duree);

        return {
            succes: true,
            bonus: typeBonus,
            duree: bonus.duree,
            expiration: new Date(Date.now() + bonus.duree)
        };
    }
}

export default PermissionsManager;

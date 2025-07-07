import { 
    EmbedBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ActionRowBuilder, 
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js';
import Logger from './logger.js';
import { ROLES_CONFIG, CATEGORIES_ROLES, SALONS_ROLES, SYSTEME_XP } from '../config/rolesNSFW.js';

const logger = new Logger('SystemeRolesNSFW');

/**
 * Système de gestion des rôles NSFW
 * Gère l'attribution, la progression et les interactions des rôles adultes
 */
class SystemeRolesNSFW {
    constructor(client) {
        this.client = client;
        this.rolesTemporaires = new Map(); // Stockage des rôles temporaires
        this.cooldowns = new Map(); // Gestion des cooldowns des commandes
        this.progressionUtilisateurs = new Map(); // XP et progression
    }

    /**
     * Initialise le système de rôles
     */
    async initialiser() {
        logger.info('Initialisation du système de rôles NSFW');
        
        // Créer les rôles s'ils n'existent pas
        await this.verifierEtCreerRoles();
        
        // Créer les salons nécessaires
        await this.verifierEtCreerSalons();
        
        // Démarrer les timers pour les rôles temporaires
        this.demarrerGestionRolesTemporaires();
        
        logger.info('Système de rôles NSFW initialisé avec succès');
    }

    /**
     * Vérifie et crée les rôles Discord nécessaires
     */
    async verifierEtCreerRoles() {
        for (const [categorie, roles] of Object.entries(ROLES_CONFIG)) {
            for (const [id, config] of Object.entries(roles)) {
                await this.creerRoleSiNecessaire(id, config);
            }
        }
    }

    /**
     * Crée un rôle Discord s'il n'existe pas
     */
    async creerRoleSiNecessaire(roleId, config) {
        try {
            const guild = this.client.guilds.cache.first();
            if (!guild) return;

            const roleExistant = guild.roles.cache.find(r => r.name === config.nom);
            if (!roleExistant) {
                await guild.roles.create({
                    name: config.nom,
                    color: config.couleur,
                    reason: `Création automatique du rôle NSFW: ${config.nom}`,
                    hoist: config.election || config.reputation // Afficher séparément certains rôles
                });
                logger.info(`Rôle créé: ${config.nom}`);
            }
        } catch (erreur) {
            logger.erreur(`Erreur lors de la création du rôle ${config.nom}`, erreur);
        }
    }

    /**
     * Vérifie et crée les salons nécessaires
     */
    async verifierEtCreerSalons() {
        const guild = this.client.guilds.cache.first();
        if (!guild) return;

        for (const [id, config] of Object.entries(SALONS_ROLES)) {
            const salonExistant = guild.channels.cache.find(c => c.name === config.nom);
            if (!salonExistant) {
                await this.creerSalonNSFW(guild, config);
            }
        }
    }

    /**
     * Crée un salon NSFW avec les permissions appropriées
     */
    async creerSalonNSFW(guild, config) {
        try {
            const permissions = this.genererPermissionsSalon(guild, config);
            
            await guild.channels.create({
                name: config.nom,
                type: 0, // GUILD_TEXT
                nsfw: config.nsfw,
                topic: config.description,
                permissionOverwrites: permissions,
                reason: `Création automatique du salon NSFW: ${config.nom}`
            });
            
            logger.info(`Salon créé: ${config.nom}`);
        } catch (erreur) {
            logger.erreur(`Erreur lors de la création du salon ${config.nom}`, erreur);
        }
    }

    /**
     * Génère les permissions pour un salon
     */
    genererPermissionsSalon(guild, config) {
        const permissions = [{
            id: guild.id,
            deny: ['ViewChannel'] // Par défaut, personne ne peut voir
        }];

        // Ajouter les permissions pour les rôles requis
        if (config.roles_requis) {
            for (const roleId of config.roles_requis) {
                const roleConfig = this.trouverRoleConfig(roleId);
                if (roleConfig) {
                    const role = guild.roles.cache.find(r => r.name === roleConfig.nom);
                    if (role) {
                        permissions.push({
                            id: role.id,
                            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
                        });
                    }
                }
            }
        }

        return permissions;
    }

    /**
     * Interface de sélection des rôles d'orientation
     */
    creerInterfaceOrientation() {
        const embed = new EmbedBuilder()
            .setTitle('🔥 Bienvenue dans l\'Univers NSFW')
            .setDescription(
                `**Choisis ton orientation pour accéder aux salons exclusifs !**\n\n` +
                `Chaque orientation débloque :\n` +
                `• Des salons privés thématiques\n` +
                `• Des badges uniques\n` +
                `• Des commandes spéciales\n\n` +
                `_Tu peux changer d'orientation à tout moment._`
            )
            .setColor('#FF1493')
            .setImage('https://i.imgur.com/wSTFkRM.png') // Image placeholder
            .setFooter({ text: 'Clique sur un bouton pour choisir ton orientation' });

        const boutons = new ActionRowBuilder();
        
        for (const [id, config] of Object.entries(ROLES_CONFIG.orientation)) {
            if (boutons.components.length < 5) {
                boutons.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`role_orientation_${id}`)
                        .setLabel(config.nom)
                        .setEmoji(config.emoji)
                        .setStyle(ButtonStyle.Primary)
                );
            }
        }

        return { embeds: [embed], components: [boutons] };
    }

    /**
     * Interface pour les rôles fun immédiats
     */
    creerInterfaceFun() {
        const embed = new EmbedBuilder()
            .setTitle('😈 Rôles Fun & Décalés')
            .setDescription(
                `**Des rôles fun à obtenir immédiatement !**\n\n` +
                `${this.listerRolesFun()}`
            )
            .setColor('#FF4500');

        const menu = new StringSelectMenuBuilder()
            .setCustomId('select_role_fun')
            .setPlaceholder('Choisis un rôle fun !')
            .setMinValues(0)
            .setMaxValues(3);

        for (const [id, config] of Object.entries(ROLES_CONFIG.fun_immediat)) {
            menu.addOptions({
                label: config.nom,
                description: config.description,
                value: id,
                emoji: config.emoji
            });
        }

        return { 
            embeds: [embed], 
            components: [new ActionRowBuilder().addComponents(menu)] 
        };
    }

    /**
     * Liste les rôles fun disponibles
     */
    listerRolesFun() {
        let liste = '';
        for (const config of Object.values(ROLES_CONFIG.fun_immediat)) {
            liste += `${config.emoji} **${config.nom}** - ${config.description}\n`;
        }
        return liste;
    }

    /**
     * Gère l'interaction avec les boutons et menus
     */
    async gererInteraction(interaction) {
        try {
            // Gérer les boutons d'orientation
            if (interaction.customId.startsWith('role_orientation_')) {
                await this.gererSelectionOrientation(interaction);
            }
            // Gérer le menu des rôles fun
            else if (interaction.customId === 'select_role_fun') {
                await this.gererSelectionFun(interaction);
            }
            // Gérer les autres interactions
            else if (interaction.customId.startsWith('role_')) {
                await this.gererAutreInteraction(interaction);
            }
        } catch (erreur) {
            logger.erreur('Erreur lors de la gestion de l\'interaction', erreur);
            await interaction.reply({ 
                content: '❌ Une erreur est survenue.', 
                ephemeral: true 
            });
        }
    }

    /**
     * Gère la sélection d'un rôle d'orientation
     */
    async gererSelectionOrientation(interaction) {
        const roleId = interaction.customId.replace('role_orientation_', '');
        const config = ROLES_CONFIG.orientation[roleId];
        
        if (!config) {
            return await interaction.reply({ 
                content: '❌ Rôle introuvable.', 
                ephemeral: true 
            });
        }

        const member = interaction.member;
        const guild = interaction.guild;
        const role = guild.roles.cache.find(r => r.name === config.nom);

        if (!role) {
            return await interaction.reply({ 
                content: '❌ Le rôle n\'existe pas encore.', 
                ephemeral: true 
            });
        }

        // Retirer les autres rôles d'orientation
        await this.retirerRolesCategorie(member, 'orientation');

        // Ajouter le nouveau rôle
        await member.roles.add(role);

        // Ajouter XP pour la première sélection
        await this.ajouterXP(member.id, 50, 'Première sélection d\'orientation');

        // Créer un embed de confirmation
        const confirmEmbed = new EmbedBuilder()
            .setTitle(`${config.emoji} Orientation mise à jour !`)
            .setDescription(
                `Tu es maintenant **${config.nom}** !\n\n` +
                `**Accès débloqués :**\n` +
                `${config.salons.map(s => `• <#${this.getSalonId(s)}>`).join('\n')}\n\n` +
                `**Badges obtenus :**\n` +
                `${config.badges.map(b => `• ${this.getBadgeEmoji(b)} ${b}`).join('\n')}`
            )
            .setColor(config.couleur)
            .setThumbnail(member.user.displayAvatarURL());

        await interaction.reply({ 
            embeds: [confirmEmbed], 
            ephemeral: true 
        });

        // Log l'événement
        logger.info(`${member.user.tag} a choisi l'orientation: ${config.nom}`);
    }

    /**
     * Gère la sélection de rôles fun
     */
    async gererSelectionFun(interaction) {
        const selections = interaction.values;
        const member = interaction.member;
        const rolesAjoutes = [];

        for (const roleId of selections) {
            const config = ROLES_CONFIG.fun_immediat[roleId];
            if (config) {
                const succes = await this.attribuerRole(member, roleId, config);
                if (succes) {
                    rolesAjoutes.push(config.nom);
                }
            }
        }

        if (rolesAjoutes.length > 0) {
            await interaction.reply({ 
                content: `✅ Rôles ajoutés: ${rolesAjoutes.join(', ')}`, 
                ephemeral: true 
            });
        } else {
            await interaction.reply({ 
                content: '❌ Aucun rôle n\'a pu être ajouté.', 
                ephemeral: true 
            });
        }
    }

    /**
     * Attribue un rôle à un membre
     */
    async attribuerRole(member, roleId, config) {
        try {
            const guild = member.guild;
            const role = guild.roles.cache.find(r => r.name === config.nom);
            
            if (!role) {
                logger.avertissement(`Rôle introuvable: ${config.nom}`);
                return false;
            }

            await member.roles.add(role);

            // Gérer les rôles temporaires
            if (config.duree) {
                this.programmerRetraitRole(member.id, role.id, config.duree);
            }

            // Envoyer un message de bienvenue si configuré
            if (config.message_bienvenue) {
                const channel = guild.systemChannel || guild.channels.cache.find(c => c.name === 'general');
                if (channel) {
                    await channel.send(`${config.emoji} ${config.message_bienvenue.replace('{user}', member.toString())}`);
                }
            }

            // Ajouter XP
            await this.ajouterXP(member.id, 25, `Rôle obtenu: ${config.nom}`);

            return true;
        } catch (erreur) {
            logger.erreur(`Erreur lors de l'attribution du rôle ${config.nom}`, erreur);
            return false;
        }
    }

    /**
     * Programme le retrait automatique d'un rôle temporaire
     */
    programmerRetraitRole(userId, roleId, duree) {
        const key = `${userId}-${roleId}`;
        
        // Annuler le timer précédent s'il existe
        if (this.rolesTemporaires.has(key)) {
            clearTimeout(this.rolesTemporaires.get(key));
        }

        // Créer un nouveau timer
        const timer = setTimeout(async () => {
            try {
                const guild = this.client.guilds.cache.first();
                const member = await guild.members.fetch(userId);
                const role = guild.roles.cache.get(roleId);
                
                if (member && role) {
                    await member.roles.remove(role);
                    logger.info(`Rôle temporaire retiré: ${role.name} de ${member.user.tag}`);
                }
                
                this.rolesTemporaires.delete(key);
            } catch (erreur) {
                logger.erreur('Erreur lors du retrait du rôle temporaire', erreur);
            }
        }, duree);

        this.rolesTemporaires.set(key, timer);
    }

    /**
     * Retire tous les rôles d'une catégorie
     */
    async retirerRolesCategorie(member, categorie) {
        const roles = ROLES_CONFIG[categorie];
        if (!roles) return;

        for (const config of Object.values(roles)) {
            const role = member.guild.roles.cache.find(r => r.name === config.nom);
            if (role && member.roles.cache.has(role.id)) {
                await member.roles.remove(role);
            }
        }
    }

    /**
     * Système de progression XP
     */
    async ajouterXP(userId, montant, raison) {
        const progression = this.progressionUtilisateurs.get(userId) || { xp: 0, niveau: 1 };
        progression.xp += montant;

        // Vérifier les level up
        const nouveauNiveau = this.calculerNiveau(progression.xp);
        if (nouveauNiveau > progression.niveau) {
            progression.niveau = nouveauNiveau;
            await this.gererLevelUp(userId, nouveauNiveau);
        }

        this.progressionUtilisateurs.set(userId, progression);
        logger.debug(`XP ajouté: ${userId} +${montant} (${raison})`);
    }

    /**
     * Calcule le niveau basé sur l'XP
     */
    calculerNiveau(xp) {
        return Math.floor(Math.sqrt(xp / 100)) + 1;
    }

    /**
     * Gère le passage de niveau
     */
    async gererLevelUp(userId, niveau) {
        // Vérifier les déblocages de rôles de progression
        for (const [roleId, config] of Object.entries(ROLES_CONFIG.progression)) {
            if (config.niveaux && config.niveaux[niveau]) {
                const guild = this.client.guilds.cache.first();
                const member = await guild.members.fetch(userId);
                const bonus = config.niveaux[niveau].bonus;
                
                // Appliquer les bonus
                logger.info(`Level up! ${member.user.tag} atteint le niveau ${niveau}`);
                // TODO: Implémenter l'attribution des bonus
            }
        }
    }

    /**
     * Démarre la gestion des rôles temporaires au démarrage
     */
    demarrerGestionRolesTemporaires() {
        // Vérifier toutes les heures les rôles temporaires
        setInterval(() => {
            this.verifierRolesTemporaires();
        }, 3600000); // 1 heure
    }

    /**
     * Vérifie et nettoie les rôles temporaires
     */
    async verifierRolesTemporaires() {
        // TODO: Implémenter la vérification des rôles temporaires depuis la base de données
        logger.debug('Vérification des rôles temporaires');
    }

    /**
     * Trouve la configuration d'un rôle par son ID
     */
    trouverRoleConfig(roleId) {
        for (const roles of Object.values(ROLES_CONFIG)) {
            if (roles[roleId]) {
                return roles[roleId];
            }
        }
        return null;
    }

    /**
     * Obtient l'ID d'un salon (placeholder)
     */
    getSalonId(salonKey) {
        // TODO: Implémenter la récupération réelle des IDs de salons
        return '000000000000000000';
    }

    /**
     * Obtient l'emoji d'un badge (placeholder)
     */
    getBadgeEmoji(badgeKey) {
        // TODO: Implémenter le système de badges
        return '🏅';
    }

    /**
     * Réaction à l'arrivée d'un nouveau membre
     */
    async onNouvelUtilisateur(member) {
        try {
            // Attendre 5 secondes pour éviter le spam
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Envoyer l'interface de sélection en MP
            const interfaceOrientation = this.creerInterfaceOrientation();
            const dm = await member.createDM();
            await dm.send(interfaceOrientation);
            
            logger.info(`Interface de sélection envoyée à ${member.user.tag}`);
        } catch (erreur) {
            logger.erreur(`Impossible d'envoyer l'interface à ${member.user.tag}`, erreur);
        }
    }
}

export default SystemeRolesNSFW;

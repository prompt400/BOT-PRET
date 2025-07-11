const VirtualVibrator = require('./devices/VirtualVibrator');
const AmbianceController = require('./devices/AmbianceController');

/**
 * IoTSimulator - Simule des dispositifs IoT érotiques via Discord
 */
class IoTSimulator {
    constructor() {
        this.devices = new Map();
        this.userDevices = new Map(); // userId -> [deviceIds]
        this.activeConnections = new Map();
        
        // Initialiser les types de dispositifs disponibles
        this.deviceTypes = {
            vibrator: VirtualVibrator,
            ambiance: AmbianceController
        };
    }

    /**
     * Crée un nouveau dispositif pour un utilisateur
     * @param {string} userId - ID de l'utilisateur
     * @param {string} deviceType - Type de dispositif
     * @param {string} deviceName - Nom personnalisé du dispositif
     * @returns {Object} Le dispositif créé
     */
    createDevice(userId, deviceType, deviceName) {
        if (!this.deviceTypes[deviceType]) {
            throw new Error(`Type de dispositif inconnu : ${deviceType}`);
        }

        const DeviceClass = this.deviceTypes[deviceType];
        const deviceId = `${userId}_${deviceType}_${Date.now()}`;
        const device = new DeviceClass(deviceId, deviceName, userId);

        this.devices.set(deviceId, device);
        
        // Ajouter à la liste des dispositifs de l'utilisateur
        if (!this.userDevices.has(userId)) {
            this.userDevices.set(userId, []);
        }
        this.userDevices.get(userId).push(deviceId);

        return device;
    }

    /**
     * Obtient tous les dispositifs d'un utilisateur
     * @param {string} userId - ID de l'utilisateur
     * @returns {Array} Liste des dispositifs
     */
    getUserDevices(userId) {
        const deviceIds = this.userDevices.get(userId) || [];
        return deviceIds.map(id => this.devices.get(id)).filter(device => device);
    }

    /**
     * Connecte deux utilisateurs pour un contrôle partagé
     * @param {string} userId1 - Premier utilisateur
     * @param {string} userId2 - Deuxième utilisateur
     * @param {string} deviceId - ID du dispositif à partager
     * @returns {Object} Connexion établie
     */
    connectUsers(userId1, userId2, deviceId) {
        const device = this.devices.get(deviceId);
        if (!device) {
            throw new Error('Dispositif introuvable');
        }

        const connectionId = `${userId1}_${userId2}_${Date.now()}`;
        const connection = {
            id: connectionId,
            users: [userId1, userId2],
            deviceId: deviceId,
            startTime: new Date(),
            active: true
        };

        this.activeConnections.set(connectionId, connection);
        device.addController(userId2); // Ajouter le deuxième utilisateur comme contrôleur

        return connection;
    }

    /**
     * Envoie une commande à un dispositif
     * @param {string} userId - ID de l'utilisateur qui envoie la commande
     * @param {string} deviceId - ID du dispositif
     * @param {string} command - Commande à exécuter
     * @param {Object} params - Paramètres de la commande
     * @returns {Object} Résultat de la commande
     */
    async sendCommand(userId, deviceId, command, params = {}) {
        const device = this.devices.get(deviceId);
        if (!device) {
            throw new Error('Dispositif introuvable');
        }

        // Vérifier les permissions
        if (!device.canControl(userId)) {
            throw new Error('Vous n\'avez pas la permission de contrôler ce dispositif');
        }

        // Exécuter la commande
        const result = await device.executeCommand(command, params);
        
        // Logger l'activité
        this.logActivity(userId, deviceId, command, result);

        return result;
    }

    /**
     * Obtient l'état actuel d'un dispositif
     * @param {string} deviceId - ID du dispositif
     * @returns {Object} État du dispositif
     */
    getDeviceStatus(deviceId) {
        const device = this.devices.get(deviceId);
        if (!device) {
            throw new Error('Dispositif introuvable');
        }

        return device.getStatus();
    }

    /**
     * Synchronise des dispositifs entre eux
     * @param {Array<string>} deviceIds - IDs des dispositifs à synchroniser
     * @returns {Object} Groupe de synchronisation créé
     */
    syncDevices(deviceIds) {
        const devices = deviceIds.map(id => this.devices.get(id)).filter(d => d);
        
        if (devices.length < 2) {
            throw new Error('Au moins 2 dispositifs sont nécessaires pour la synchronisation');
        }

        const syncGroup = {
            id: `sync_${Date.now()}`,
            devices: deviceIds,
            master: deviceIds[0],
            created: new Date()
        };

        // Le premier dispositif devient le maître
        devices.forEach((device, index) => {
            if (index === 0) {
                device.setAsMaster(syncGroup.id);
            } else {
                device.syncWith(devices[0]);
            }
        });

        return syncGroup;
    }

    /**
     * Crée un pattern personnalisé
     * @param {string} name - Nom du pattern
     * @param {Array} sequence - Séquence de commandes
     * @returns {Object} Pattern créé
     */
    createPattern(name, sequence) {
        const pattern = {
            id: `pattern_${Date.now()}`,
            name: name,
            sequence: sequence,
            created: new Date()
        };

        // Sauvegarder le pattern
        // TODO: Implémenter la sauvegarde persistante

        return pattern;
    }

    /**
     * Exécute un pattern sur un dispositif
     * @param {string} deviceId - ID du dispositif
     * @param {string} patternId - ID du pattern
     * @param {number} loops - Nombre de répétitions (0 = infini)
     */
    async playPattern(deviceId, patternId, loops = 1) {
        const device = this.devices.get(deviceId);
        if (!device) {
            throw new Error('Dispositif introuvable');
        }

        // TODO: Charger le pattern depuis la base de données
        const pattern = { /* pattern data */ };

        let currentLoop = 0;
        while (currentLoop < loops || loops === 0) {
            for (const step of pattern.sequence) {
                await device.executeCommand(step.command, step.params);
                await this.delay(step.duration || 1000);
            }
            currentLoop++;
            
            // Vérifier si le dispositif est toujours actif
            if (!device.isActive()) break;
        }
    }

    /**
     * Active le mode ambiance pour une session
     * @param {Array<string>} userIds - IDs des utilisateurs participants
     * @param {string} theme - Thème de l'ambiance
     * @returns {Object} Session d'ambiance
     */
    async startAmbianceSession(userIds, theme = 'romantic') {
        const session = {
            id: `ambiance_${Date.now()}`,
            users: userIds,
            theme: theme,
            devices: [],
            startTime: new Date()
        };

        // Créer des contrôleurs d'ambiance pour chaque utilisateur
        for (const userId of userIds) {
            const ambiance = this.createDevice(userId, 'ambiance', `Ambiance ${theme}`);
            session.devices.push(ambiance.id);
            
            // Configurer selon le thème
            await ambiance.setTheme(theme);
            await ambiance.activate();
        }

        // Synchroniser tous les dispositifs d'ambiance
        if (session.devices.length > 1) {
            this.syncDevices(session.devices);
        }

        return session;
    }

    /**
     * Obtient les statistiques d'utilisation
     * @param {string} userId - ID de l'utilisateur (optionnel)
     * @returns {Object} Statistiques
     */
    getUsageStats(userId = null) {
        const stats = {
            totalDevices: this.devices.size,
            activeConnections: this.activeConnections.size,
            deviceTypes: {}
        };

        // Compter par type de dispositif
        for (const device of this.devices.values()) {
            const type = device.type;
            stats.deviceTypes[type] = (stats.deviceTypes[type] || 0) + 1;
        }

        if (userId) {
            stats.userDevices = this.getUserDevices(userId).length;
            // TODO: Ajouter plus de stats utilisateur spécifiques
        }

        return stats;
    }

    /**
     * Nettoie les dispositifs inactifs
     * @param {number} maxInactiveTime - Temps d'inactivité max en ms
     */
    cleanupInactiveDevices(maxInactiveTime = 3600000) { // 1 heure par défaut
        const now = Date.now();
        const toRemove = [];

        for (const [deviceId, device] of this.devices.entries()) {
            if (now - device.lastActivity > maxInactiveTime) {
                toRemove.push(deviceId);
            }
        }

        for (const deviceId of toRemove) {
            this.removeDevice(deviceId);
        }

        return toRemove.length;
    }

    /**
     * Supprime un dispositif
     * @param {string} deviceId - ID du dispositif
     */
    removeDevice(deviceId) {
        const device = this.devices.get(deviceId);
        if (!device) return;

        // Retirer de la liste de l'utilisateur
        const userDeviceList = this.userDevices.get(device.ownerId);
        if (userDeviceList) {
            const index = userDeviceList.indexOf(deviceId);
            if (index > -1) {
                userDeviceList.splice(index, 1);
            }
        }

        // Désactiver et supprimer
        device.deactivate();
        this.devices.delete(deviceId);
    }

    /**
     * Délai asynchrone
     * @param {number} ms - Millisecondes
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Enregistre l'activité pour les analytics
     * @param {string} userId - ID de l'utilisateur
     * @param {string} deviceId - ID du dispositif
     * @param {string} action - Action effectuée
     * @param {Object} result - Résultat de l'action
     */
    logActivity(userId, deviceId, action, result) {
        // TODO: Implémenter le logging vers une base de données
        console.log(`[IoT Activity] User: ${userId}, Device: ${deviceId}, Action: ${action}`);
    }
}

module.exports = IoTSimulator;

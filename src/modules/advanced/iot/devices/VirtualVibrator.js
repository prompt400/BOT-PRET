/**
 * VirtualVibrator - Simulateur de dispositif vibrant virtuel via Discord
 */
class VirtualVibrator {
    constructor(deviceId, deviceName, ownerId) {
        this.deviceId = deviceId;
        this.deviceName = deviceName;
        this.ownerId = ownerId;
        this.type = 'vibrator';
        this.intensity = 0;
        this.pattern = null;
        this.active = false;
        this.controllers = new Set([ownerId]);
        this.lastActivity = Date.now();
        this.syncGroup = null;
        
        // Patterns prédéfinis
        this.patterns = {
            pulse: { name: 'Pulsation', emoji: '💓', sequence: [0, 5, 0, 5, 0, 5] },
            wave: { name: 'Vague', emoji: '🌊', sequence: [0, 2, 4, 6, 8, 10, 8, 6, 4, 2] },
            crescendo: { name: 'Crescendo', emoji: '🚀', sequence: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
            random: { name: 'Aléatoire', emoji: '🎲', sequence: 'random' },
            heartbeat: { name: 'Battement', emoji: '💗', sequence: [0, 8, 4, 8, 0, 0, 8, 4, 8, 0] }
        };
    }

    /**
     * Définit l'intensité du vibrateur
     * @param {number} intensity - Niveau d'intensité (0-10)
     */
    setIntensity(intensity) {
        this.intensity = Math.max(0, Math.min(intensity, 10));
        this.lastActivity = Date.now();
        console.log(`🔊 Intensité ${this.deviceName}: ${this.intensity}`);
    }

    /**
     * Active le vibrateur
     */
    activate() {
        this.active = true;
        this.lastActivity = Date.now();
        console.log(`⚡ ${this.deviceName} activé.`);
    }

    /**
     * Désactive le vibrateur
     */
    deactivate() {
        this.active = false;
        this.lastActivity = Date.now();
        console.log(`🔌 ${this.deviceName} désactivé.`);
    }

    /**
     * Exécute une commande sur le dispositif
     * @param {string} command - Commande à exécuter
     * @param {Object} params - Paramètres de la commande
     * @returns {Object} Résultat de l'exécution
     */
    async executeCommand(command, params) {
        this.lastActivity = Date.now();
        
        switch(command) {
            case 'setIntensity':
                this.setIntensity(params.intensity);
                return { 
                    success: true, 
                    intensity: this.intensity,
                    emoji: this.getIntensityEmoji(),
                    message: `${this.deviceName} réglé à ${this.intensity}/10 ${this.getIntensityEmoji()}`
                };
                
            case 'activate':
                this.activate();
                return { 
                    success: true, 
                    message: `⚡ ${this.deviceName} activé !`,
                    emoji: '⚡'
                };
                
            case 'deactivate':
                this.deactivate();
                return { 
                    success: true, 
                    message: `🔌 ${this.deviceName} désactivé.`,
                    emoji: '🔌'
                };
                
            case 'pattern':
                return await this.playPattern(params.patternName);
                
            case 'pulse':
                return this.quickPulse(params.times || 3);
                
            default:
                return { success: false, message: `Commande inconnue: ${command}` };
        }
    }

    /**
     * Vérifie si l'utilisateur peut contrôler le dispositif
     * @param {string} userId - ID de l'utilisateur
     * @returns {boolean} True si l'utilisateur peut contrôler
     */
    canControl(userId) {
        return this.controllers.has(userId);
    }

    /**
     * Ajoute un contrôleur supplémentaire
     * @param {string} userId - ID de l'utilisateur à ajouter
     */
    addController(userId) {
        this.controllers.add(userId);
    }

    /**
     * Obtient l'état actuel
     * @returns {Object} État
     */
    getStatus() {
        return {
            id: this.deviceId,
            name: this.deviceName,
            type: this.type,
            intensity: this.intensity,
            active: this.active,
            lastActivity: this.lastActivity
        };
    }

    /**
     * Vérifie si le dispositif est actif
     * @returns {boolean} Actif ou pas
     */
    isActive() {
        return this.active;
    }

    /**
     * À utiliser pour régler un group sync
     * @param {string} groupId - ID du groupe
     */
    setAsMaster(groupId) {
        this.syncGroup = groupId;
        console.log(`${this.deviceName} est maintenant le maître de synchronisation !`);
    }

    /**
     * Synchroniser avec un autre dispositif
     * @param {VirtualVibrator} masterDevice - Dispositif maître
     */
    syncWith(masterDevice) {
        this.intensity = masterDevice.intensity;
        this.pattern = masterDevice.pattern;
        this.activate();
        console.log(`${this.deviceName} synchronisé avec ${masterDevice.deviceName}.`);
    }

    /**
     * Joue un pattern de vibration
     * @param {string} patternName - Nom du pattern
     * @returns {Object} Résultat
     */
    async playPattern(patternName) {
        if (!this.patterns[patternName]) {
            return { success: false, message: 'Pattern inconnu' };
        }
        
        this.pattern = this.patterns[patternName];
        const emoji = this.pattern.emoji;
        
        return {
            success: true,
            message: `${emoji} Pattern "${this.pattern.name}" activé sur ${this.deviceName} !`,
            pattern: this.pattern.name,
            emoji: emoji
        };
    }

    /**
     * Pulsation rapide
     * @param {number} times - Nombre de pulsations
     * @returns {Object} Résultat
     */
    quickPulse(times) {
        return {
            success: true,
            message: `💓 ${this.deviceName} pulse ${times} fois !`,
            pulses: times,
            emoji: '💓'
        };
    }

    /**
     * Obtient l'emoji correspondant à l'intensité
     * @returns {string} Emoji
     */
    getIntensityEmoji() {
        if (this.intensity === 0) return '🔴';
        if (this.intensity <= 3) return '🟡';
        if (this.intensity <= 6) return '🟠';
        if (this.intensity <= 9) return '🔵';
        return '🟣';
    }

    /**
     * Génère une représentation visuelle de l'intensité
     * @returns {string} Barre visuelle
     */
    getIntensityBar() {
        const filled = '█'.repeat(this.intensity);
        const empty = '░'.repeat(10 - this.intensity);
        return `[${filled}${empty}]`;
    }

    /**
     * Obtient une description détaillée de l'état
     * @returns {string} Description
     */
    getDetailedStatus() {
        let status = `**${this.deviceName}** ${this.active ? '⚡' : '🔌'}\n`;
        status += `Intensité: ${this.intensity}/10 ${this.getIntensityEmoji()}\n`;
        status += `${this.getIntensityBar()}\n`;
        
        if (this.pattern) {
            status += `Pattern: ${this.pattern.emoji} ${this.pattern.name}\n`;
        }
        
        if (this.controllers.size > 1) {
            status += `Contrôleurs: ${this.controllers.size} personnes\n`;
        }
        
        return status;
    }
}

module.exports = VirtualVibrator;


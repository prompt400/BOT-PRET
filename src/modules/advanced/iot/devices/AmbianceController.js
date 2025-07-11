/**
 * AmbianceController - Contrôleur d'ambiance immersive via Discord
 */
class AmbianceController {
    constructor(deviceId, deviceName, ownerId) {
        this.deviceId = deviceId;
        this.deviceName = deviceName;
        this.ownerId = ownerId;
        this.type = 'ambiance';
        this.active = false;
        this.controllers = new Set([ownerId]);
        this.lastActivity = Date.now();
        
        // État de l'ambiance
        this.ambiance = {
            theme: 'romantic',
            temperature: 'tiède',
            lighting: { color: '#FF69B4', intensity: 50, effect: 'statique' },
            sound: { type: 'vagues', volume: 30 },
            scent: 'roses'
        };
        
        // Thèmes prédéfinis
        this.themes = {
            romantic: {
                name: 'Romantique',
                emoji: '🌹',
                temperature: 'tiède',
                lighting: { color: '#FF69B4', intensity: 30, effect: 'bougie' },
                sound: { type: 'jazz doux', volume: 25 },
                scent: 'roses'
            },
            passionate: {
                name: 'Passionné',
                emoji: '🔥',
                temperature: 'chaud',
                lighting: { color: '#FF0000', intensity: 70, effect: 'pulsation' },
                sound: { type: 'battements de cœur', volume: 40 },
                scent: 'musc'
            },
            relaxing: {
                name: 'Relaxant',
                emoji: '🌊',
                temperature: 'frais',
                lighting: { color: '#00CED1', intensity: 20, effect: 'vague' },
                sound: { type: 'vagues océan', volume: 35 },
                scent: 'lavande'
            },
            exotic: {
                name: 'Exotique',
                emoji: '🌺',
                temperature: 'tropical',
                lighting: { color: '#FFD700', intensity: 60, effect: 'scintillement' },
                sound: { type: 'forêt tropicale', volume: 30 },
                scent: 'vanille coco'
            },
            mystical: {
                name: 'Mystique',
                emoji: '✨',
                temperature: 'mystérieux',
                lighting: { color: '#9400D3', intensity: 40, effect: 'aurore' },
                sound: { type: 'carillons éoliens', volume: 20 },
                scent: 'encens'
            }
        };
    }

    /**
     * Active le contrôleur d'ambiance
     */
    activate() {
        this.active = true;
        this.lastActivity = Date.now();
        console.log(`✨ ${this.deviceName} activé.`);
    }

    /**
     * Désactive le contrôleur
     */
    deactivate() {
        this.active = false;
        this.lastActivity = Date.now();
        console.log(`🔌 ${this.deviceName} désactivé.`);
    }

    /**
     * Définit un thème d'ambiance
     * @param {string} themeName - Nom du thème
     */
    async setTheme(themeName) {
        if (!this.themes[themeName]) {
            throw new Error(`Thème inconnu : ${themeName}`);
        }
        
        const theme = this.themes[themeName];
        this.ambiance = { ...theme, theme: themeName };
        this.lastActivity = Date.now();
        
        return {
            success: true,
            theme: theme.name,
            emoji: theme.emoji,
            message: `${theme.emoji} Ambiance ${theme.name} activée !`
        };
    }

    /**
     * Exécute une commande
     * @param {string} command - Commande à exécuter
     * @param {Object} params - Paramètres
     * @returns {Object} Résultat
     */
    async executeCommand(command, params = {}) {
        this.lastActivity = Date.now();
        
        switch(command) {
            case 'activate':
                this.activate();
                return { 
                    success: true, 
                    message: `✨ ${this.deviceName} activé !`,
                    status: this.getDetailedStatus()
                };
                
            case 'deactivate':
                this.deactivate();
                return { 
                    success: true, 
                    message: `🔌 ${this.deviceName} désactivé.`
                };
                
            case 'setTheme':
                return await this.setTheme(params.theme);
                
            case 'adjustLighting':
                return this.adjustLighting(params);
                
            case 'adjustSound':
                return this.adjustSound(params);
                
            case 'adjustTemperature':
                return this.adjustTemperature(params.level);
                
            case 'randomize':
                return this.randomizeAmbiance();
                
            default:
                return { success: false, message: `Commande inconnue : ${command}` };
        }
    }

    /**
     * Ajuste l'éclairage
     * @param {Object} params - Paramètres d'éclairage
     * @returns {Object} Résultat
     */
    adjustLighting(params) {
        if (params.color) this.ambiance.lighting.color = params.color;
        if (params.intensity) this.ambiance.lighting.intensity = Math.max(0, Math.min(100, params.intensity));
        if (params.effect) this.ambiance.lighting.effect = params.effect;
        
        return {
            success: true,
            message: `💡 Éclairage ajusté : ${this.ambiance.lighting.effect} ${this.ambiance.lighting.intensity}%`,
            lighting: this.ambiance.lighting
        };
    }

    /**
     * Ajuste le son
     * @param {Object} params - Paramètres sonores
     * @returns {Object} Résultat
     */
    adjustSound(params) {
        if (params.type) this.ambiance.sound.type = params.type;
        if (params.volume) this.ambiance.sound.volume = Math.max(0, Math.min(100, params.volume));
        
        const soundEmojis = {
            'jazz doux': '🎷',
            'vagues océan': '🌊',
            'battements de cœur': '💓',
            'forêt tropicale': '🌴',
            'carillons éoliens': '🎐'
        };
        
        const emoji = soundEmojis[this.ambiance.sound.type] || '🎵';
        
        return {
            success: true,
            message: `${emoji} Son : ${this.ambiance.sound.type} à ${this.ambiance.sound.volume}%`,
            sound: this.ambiance.sound
        };
    }

    /**
     * Ajuste la température
     * @param {string} level - Niveau de température
     * @returns {Object} Résultat
     */
    adjustTemperature(level) {
        const temps = {
            'glacial': { emoji: '🧊', desc: 'Frissons garantis' },
            'frais': { emoji: '❄️', desc: 'Agréablement frais' },
            'tiède': { emoji: '☀️', desc: 'Confortablement tiède' },
            'chaud': { emoji: '🔥', desc: 'Chaleur sensuelle' },
            'tropical': { emoji: '🌴', desc: 'Chaleur tropicale' },
            'mystérieux': { emoji: '🌫️', desc: 'Température énigmatique' }
        };
        
        if (!temps[level]) {
            return { success: false, message: 'Niveau de température inconnu' };
        }
        
        this.ambiance.temperature = level;
        const temp = temps[level];
        
        return {
            success: true,
            message: `${temp.emoji} Température ${level} - ${temp.desc}`,
            temperature: level
        };
    }

    /**
     * Randomise l'ambiance
     * @returns {Object} Résultat
     */
    randomizeAmbiance() {
        const themeNames = Object.keys(this.themes);
        const randomTheme = themeNames[Math.floor(Math.random() * themeNames.length)];
        this.setTheme(randomTheme);
        
        return {
            success: true,
            message: `🎲 Ambiance aléatoire : ${this.themes[randomTheme].emoji} ${this.themes[randomTheme].name} !`,
            theme: randomTheme
        };
    }

    /**
     * Vérifie les permissions
     * @param {string} userId - ID utilisateur
     * @returns {boolean} Autorisé ou non
     */
    canControl(userId) {
        return this.controllers.has(userId);
    }

    /**
     * Ajoute un contrôleur
     * @param {string} userId - ID utilisateur
     */
    addController(userId) {
        this.controllers.add(userId);
    }

    /**
     * Obtient le statut
     * @returns {Object} Statut actuel
     */
    getStatus() {
        return {
            id: this.deviceId,
            name: this.deviceName,
            type: this.type,
            active: this.active,
            ambiance: this.ambiance,
            lastActivity: this.lastActivity
        };
    }

    /**
     * Obtient une description détaillée
     * @returns {string} Description formatée
     */
    getDetailedStatus() {
        const theme = this.themes[this.ambiance.theme] || {};
        let status = `**${this.deviceName}** ${this.active ? '✨' : '🔌'}\n`;
        status += `${theme.emoji || '🎭'} Thème : ${theme.name || 'Personnalisé'}\n\n`;
        
        status += `💡 **Éclairage**\n`;
        status += `Couleur : ${this.ambiance.lighting.color}\n`;
        status += `Intensité : ${this.ambiance.lighting.intensity}%\n`;
        status += `Effet : ${this.ambiance.lighting.effect}\n\n`;
        
        status += `🎵 **Son**\n`;
        status += `Type : ${this.ambiance.sound.type}\n`;
        status += `Volume : ${this.ambiance.sound.volume}%\n\n`;
        
        status += `🌡️ **Température** : ${this.ambiance.temperature}\n`;
        status += `🌸 **Parfum** : ${this.ambiance.scent}\n`;
        
        return status;
    }

    /**
     * Vérifie si actif
     * @returns {boolean} État actif
     */
    isActive() {
        return this.active;
    }

    /**
     * Définit comme maître de sync
     * @param {string} groupId - ID du groupe
     */
    setAsMaster(groupId) {
        this.syncGroup = groupId;
        console.log(`${this.deviceName} est le maître d'ambiance !`);
    }

    /**
     * Synchronise avec un autre contrôleur
     * @param {AmbianceController} masterDevice - Contrôleur maître
     */
    syncWith(masterDevice) {
        this.ambiance = { ...masterDevice.ambiance };
        this.activate();
        console.log(`${this.deviceName} synchronisé avec ${masterDevice.deviceName}.`);
    }

    /**
     * Crée une transition douce entre deux thèmes
     * @param {string} targetTheme - Thème cible
     * @param {number} duration - Durée en ms
     * @returns {Object} Résultat
     */
    async transitionTo(targetTheme, duration = 5000) {
        const startTheme = this.ambiance.theme;
        
        return {
            success: true,
            message: `🌈 Transition de ${this.themes[startTheme].emoji} vers ${this.themes[targetTheme].emoji} en ${duration/1000}s`,
            from: startTheme,
            to: targetTheme,
            duration: duration
        };
    }
}

module.exports = AmbianceController;

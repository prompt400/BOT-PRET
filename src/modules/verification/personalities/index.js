// Index des personnalités disponibles

const BasePersonality = require('./BasePersonality');
const DominantPersonality = require('./DominantPersonality');
const PlayfulPersonality = require('./PlayfulPersonality');
const SoftPersonality = require('./SoftPersonality');

module.exports = {
    BasePersonality,
    DominantPersonality,
    PlayfulPersonality,
    SoftPersonality,
    
    /**
     * Obtenir une personnalité par son nom
     */
    getPersonality(name) {
        const personalities = {
            'dominant': DominantPersonality,
            'playful': PlayfulPersonality,
            'soft': SoftPersonality
        };
        
        const PersonalityClass = personalities[name.toLowerCase()];
        if (!PersonalityClass) {
            throw new Error(`Personnalité '${name}' non trouvée`);
        }
        
        return new PersonalityClass();
    },
    
    /**
     * Obtenir toutes les personnalités disponibles
     */
    getAllPersonalities() {
        return ['dominant', 'playful', 'soft'];
    },
    
    /**
     * Obtenir une personnalité aléatoire
     */
    getRandomPersonality() {
        const personalities = ['dominant', 'playful', 'soft'];
        const randomIndex = Math.floor(Math.random() * personalities.length);
        return this.getPersonality(personalities[randomIndex]);
    }
};

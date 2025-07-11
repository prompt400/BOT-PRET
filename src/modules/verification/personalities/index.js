// Index des personnalités disponibles

import BasePersonality from './BasePersonality.js';
import DominantPersonality from './DominantPersonality.js';
import PlayfulPersonality from './PlayfulPersonality.js';
import SoftPersonality from './SoftPersonality.js';

export {
    BasePersonality,
    DominantPersonality,
    PlayfulPersonality,
    SoftPersonality,
    
};

/**
 * Obtenir une personnalité par son nom
 */
export function getPersonality(name) {
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
}

/**
 * Obtenir toutes les personnalités disponibles
 */
export function getAllPersonalities() {
        return ['dominant', 'playful', 'soft'];
}

/**
 * Obtenir une personnalité aléatoire
 */
export function getRandomPersonality() {
    const personalities = ['dominant', 'playful', 'soft'];
    const randomIndex = Math.floor(Math.random() * personalities.length);
    return getPersonality(personalities[randomIndex]);
}

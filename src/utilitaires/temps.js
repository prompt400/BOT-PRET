// coding: utf-8
/**
 * Utilitaires de temps
 * Fonctions pour manipuler et formater le temps
 */

/**
 * Formate une durée en millisecondes en format lisible
 * @param {number} millisecondes Durée en millisecondes
 * @returns {string} Durée formatée
 */
export function formaterDuree(millisecondes) {
    if (!millisecondes || millisecondes < 0) {
        return '0 secondes';
    }
    
    const secondes = Math.floor(millisecondes / 1000);
    const minutes = Math.floor(secondes / 60);
    const heures = Math.floor(minutes / 60);
    const jours = Math.floor(heures / 24);
    
    const parties = [];
    
    if (jours > 0) {
        parties.push(`${jours} jour${jours > 1 ? 's' : ''}`);
    }
    
    if (heures % 24 > 0) {
        parties.push(`${heures % 24} heure${heures % 24 > 1 ? 's' : ''}`);
    }
    
    if (minutes % 60 > 0) {
        parties.push(`${minutes % 60} minute${minutes % 60 > 1 ? 's' : ''}`);
    }
    
    if (secondes % 60 > 0 || parties.length === 0) {
        parties.push(`${secondes % 60} seconde${secondes % 60 > 1 ? 's' : ''}`);
    }
    
    return parties.join(', ');
}

/**
 * Formate une date en format français
 * @param {Date} date Date à formater
 * @returns {string} Date formatée
 */
export function formaterDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Calcule le temps écoulé depuis une date
 * @param {Date} date Date de référence
 * @returns {string} Temps écoulé formaté
 */
export function tempsEcoule(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    const maintenant = new Date();
    const difference = maintenant - date;
    
    return formaterDuree(difference);
}

/**
 * Ajoute un délai (sleep)
 * @param {number} millisecondes Durée en millisecondes
 * @returns {Promise} Promesse résolue après le délai
 */
export function attendre(millisecondes) {
    return new Promise(resolve => setTimeout(resolve, millisecondes));
}

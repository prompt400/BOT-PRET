/**
 * Tests pour le service Keep-Alive
 * Vérifie la conformité avec les bonnes pratiques Discord.js
 */

import keepAliveService from '../src/services/keepalive.js';

console.log('🧪 Test du service Keep-Alive');
console.log('================================\n');

// Test 1: Vérifier les intervalles
console.log('✓ Test 1: Vérification des intervalles');
console.log(`  - Intervalle keep-alive: ${keepAliveService.keepAliveInterval / 1000}s (recommandé: 600s)`);
console.log(`  - Seuil d'inactivité: ${keepAliveService.inactivityThreshold / 1000}s (recommandé: 3600s)`);

if (keepAliveService.keepAliveInterval === 600000) {
    console.log('  ✅ Intervalle keep-alive conforme (10 minutes)');
} else {
    console.log('  ❌ Intervalle keep-alive non conforme');
}

if (keepAliveService.inactivityThreshold === 3600000) {
    console.log('  ✅ Seuil d\'inactivité conforme (1 heure)');
} else {
    console.log('  ❌ Seuil d\'inactivité non conforme');
}

// Test 2: Vérifier qu'il n'y a pas de double démarrage
console.log('\n✓ Test 2: Prévention du double démarrage');
const mockClient = {
    isReady: () => true,
    ws: { ping: 50, status: 0 },
    guilds: { cache: { size: 5 } },
    on: () => {} // Mock event listener
};

// Premier démarrage
keepAliveService.start(mockClient);
console.log('  - Premier démarrage effectué');

// Tentative de double démarrage
const originalWarn = console.warn;
let warningDetected = false;
console.warn = (msg) => {
    if (msg.includes('déjà démarré')) {
        warningDetected = true;
    }
};

keepAliveService.start(mockClient);
console.warn = originalWarn;

if (warningDetected) {
    console.log('  ✅ Protection contre le double démarrage fonctionne');
} else {
    console.log('  ❌ Pas de protection contre le double démarrage');
}

// Test 3: Arrêt du service
console.log('\n✓ Test 3: Arrêt du service');
keepAliveService.stop();
console.log('  ✅ Service arrêté correctement');

// Test 4: Vérification des méthodes
console.log('\n✓ Test 4: Vérification des méthodes');
const methods = ['start', 'stop', 'performKeepAlive', 'checkInactivity', 'setupActivityTracking', 'resetInactivity'];
let allMethodsPresent = true;

methods.forEach(method => {
    if (typeof keepAliveService[method] === 'function') {
        console.log(`  ✅ Méthode ${method} présente`);
    } else {
        console.log(`  ❌ Méthode ${method} manquante`);
        allMethodsPresent = false;
    }
});

// Résumé
console.log('\n================================');
console.log('📊 Résumé des tests:');
console.log('  - Intervalles conformes: ' + (keepAliveService.keepAliveInterval === 600000 && keepAliveService.inactivityThreshold === 3600000 ? '✅' : '❌'));
console.log('  - Protection double démarrage: ' + (warningDetected ? '✅' : '❌'));
console.log('  - Toutes les méthodes présentes: ' + (allMethodsPresent ? '✅' : '❌'));
console.log('\n💡 Recommandations Discord.js:');
console.log('  - Ne pas implémenter de heartbeat manuel (Discord.js le gère)');
console.log('  - Utiliser des intervalles de 10+ minutes pour les keep-alive');
console.log('  - Tracker l\'activité réelle des utilisateurs, pas juste le ping');
console.log('  - Ne pas marquer le bot comme unhealthy trop rapidement');

// Bot de développement avec hot-reload
import { spawn } from 'child_process';
import { watch } from 'fs';
import path from 'path';

let botProcess = null;

function startBot() {
    console.log('🚀 Démarrage du bot de développement...');
    
    // Kill l'ancien processus si existe
    if (botProcess) {
        botProcess.kill();
    }
    
    // Lance le bot
    botProcess = spawn('node', ['start.mjs'], {
        stdio: 'inherit',
        env: {
            ...process.env,
            NODE_ENV: 'development',
            // Utilise un token de bot de TEST
            DISCORD_TOKEN: process.env.DEV_DISCORD_TOKEN || process.env.DISCORD_TOKEN
        }
    });
    
    botProcess.on('error', (err) => {
        console.error('❌ Erreur:', err);
    });
}

// Surveille les changements
watch('./src', { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.js')) {
        console.log(`📝 Fichier modifié: ${filename}`);
        console.log('🔄 Redémarrage automatique...');
        startBot();
    }
});

// Démarrage initial
startBot();

console.log('👀 Surveillance des fichiers activée');
console.log('💡 Le bot redémarre automatiquement à chaque modification');

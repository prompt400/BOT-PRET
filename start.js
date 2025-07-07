#!/usr/bin/env node

/**
 * Script de démarrage robuste pour Railway
 * Gère les signaux et les arrêts gracieux de manière fiable
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('[Launcher] Démarrage du bot Discord...');

// Chemin vers le fichier principal
const mainFile = join(__dirname, 'BOT-PRET-main', 'src', 'index.js');

// Lancement du processus enfant
const child = spawn('node', [mainFile], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production'
    }
});

// Gestion des erreurs du processus enfant
child.on('error', (error) => {
    console.error('[Launcher] Erreur lors du lancement:', error);
    process.exit(1);
});

// Gestion de la fermeture du processus enfant
child.on('exit', (code, signal) => {
    console.log(`[Launcher] Processus terminé avec code ${code} et signal ${signal}`);
    
    // Si le processus s'est terminé normalement (code 0), on sort proprement
    if (code === 0) {
        process.exit(0);
    }
    
    // Si c'est un arrêt forcé par signal, on sort avec le code approprié
    if (signal) {
        console.log(`[Launcher] Arrêt par signal ${signal}`);
        process.exit(0);
    }
    
    // Sinon, on sort avec le code d'erreur
    process.exit(code || 1);
});

// Gestion des signaux pour arrêt gracieux
const signals = ['SIGTERM', 'SIGINT', 'SIGHUP'];

signals.forEach(signal => {
    process.on(signal, () => {
        console.log(`[Launcher] Signal ${signal} reçu, transmission au bot...`);
        
        // Transmettre le signal au processus enfant
        if (child && !child.killed) {
            child.kill(signal);
            
            // Timeout pour forcer l'arrêt si le processus ne répond pas
            setTimeout(() => {
                if (!child.killed) {
                    console.log('[Launcher] Timeout atteint, arrêt forcé...');
                    child.kill('SIGKILL');
                }
            }, 15000); // 15 secondes
        }
    });
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
    console.error('[Launcher] Exception non capturée:', error);
    if (child && !child.killed) {
        child.kill('SIGTERM');
    }
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[Launcher] Promesse rejetée non gérée:', reason);
});

console.log('[Launcher] Launcher prêt, en attente du bot...');

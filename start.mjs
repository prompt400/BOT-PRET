#!/usr/bin/env node
// coding: utf-8

/**
 * Script de démarrage robuste avec gestion améliorée pour Railway
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('[Launcher] Démarrage du bot Discord...');

// Chemin vers le fichier principal
const mainFile = join(__dirname, 'src', 'index.mjs');

// Lancement du processus enfant
const child = spawn('node', [mainFile], {
    stdio: 'inherit',
    env: {
        ...process.env,
        LANG: 'C.UTF-8'
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
    
    if (code === 0) {
        process.exit(0);
    }
    
    if (signal) {
        console.log(`[Launcher] Arrêt par signal ${signal}`);
        process.exit(0);
    }
    
    process.exit(code || 1);
});

// Gestion des signaux pour arrêt gracieux
const signals = ['SIGTERM', 'SIGINT', 'SIGHUP'];

signals.forEach(signal => {
    process.on(signal, () => {
        console.log(`[Launcher] Signal ${signal} reçu, transmission au bot...`);
        
        if (child && !child.killed) {
            child.kill(signal);
            
            setTimeout(() => {
                if (!child.killed) {
                    console.log('[Launcher] Timeout atteint, arrêt forcé...');
                    child.kill('SIGKILL');
                }
            }, 15000);
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

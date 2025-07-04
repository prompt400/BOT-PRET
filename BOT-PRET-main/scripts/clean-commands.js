/**
 * Script de nettoyage des commandes Discord
 * 
 * Ce script supprime toutes les commandes enregistrées sur Discord
 * et ne ré-enregistre que la commande /status
 */

import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Configuration des chemins
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '../../.env') });

// Validation des variables
if (!process.env.DISCORD_TOKEN || !process.env.DISCORD_CLIENT_ID) {
    console.error('❌ Variables d\'environnement manquantes (DISCORD_TOKEN ou DISCORD_CLIENT_ID)');
    process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function cleanCommands() {
    try {
        console.log('🧹 Début du nettoyage des commandes Discord...\n');

        // 1. Récupérer toutes les commandes globales existantes
        console.log('📋 Récupération des commandes globales...');
        const globalCommands = await rest.get(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID)
        );
        console.log(`   Trouvé ${globalCommands.length} commandes globales`);

        // 2. Récupérer tous les serveurs où le bot est présent
        console.log('\n📋 Récupération des serveurs...');
        const guilds = await rest.get(Routes.userGuilds());
        console.log(`   Bot présent sur ${guilds.length} serveur(s)`);

        // 3. Supprimer toutes les commandes globales
        if (globalCommands.length > 0) {
            console.log('\n🗑️  Suppression des commandes globales...');
            for (const command of globalCommands) {
                console.log(`   - Suppression de /${command.name}`);
                await rest.delete(
                    Routes.applicationCommand(process.env.DISCORD_CLIENT_ID, command.id)
                );
            }
        }

        // 4. Supprimer les commandes de chaque serveur
        console.log('\n🗑️  Suppression des commandes par serveur...');
        for (const guild of guilds) {
            try {
                const guildCommands = await rest.get(
                    Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, guild.id)
                );
                
                if (guildCommands.length > 0) {
                    console.log(`   Serveur ${guild.name} : ${guildCommands.length} commandes`);
                    for (const command of guildCommands) {
                        console.log(`     - Suppression de /${command.name}`);
                        await rest.delete(
                            Routes.applicationGuildCommand(
                                process.env.DISCORD_CLIENT_ID, 
                                guild.id, 
                                command.id
                            )
                        );
                    }
                }
            } catch (error) {
                console.log(`   ⚠️  Impossible d'accéder au serveur ${guild.name}`);
            }
        }

        // 5. Ré-enregistrer uniquement la commande /status
        console.log('\n✅ Enregistrement de la commande /status uniquement...');
        const statusCommand = {
            name: 'status',
            description: 'Affiche le statut et les informations du bot',
            options: []
        };

        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: [statusCommand] }
        );

        console.log('\n✨ Nettoyage terminé avec succès !');
        console.log('   - Toutes les anciennes commandes ont été supprimées');
        console.log('   - Seule /status est maintenant disponible');
        console.log('\n⚠️  Note : Discord peut prendre jusqu\'à 1 heure pour actualiser le cache');
        console.log('   Redémarrez Discord pour forcer l\'actualisation');

    } catch (error) {
        console.error('❌ Erreur lors du nettoyage :', error);
        process.exit(1);
    }
}

// Exécuter le nettoyage
cleanCommands();

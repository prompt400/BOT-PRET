import { REST, Routes, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { promises as fs } from 'fs';
import path from 'path';
import logger from '../utils/logger.js';
import { CommandMetadata } from '../types/commands.js';

export class CommandDeployer {
    private readonly rest: REST;
    private readonly clientId: string;
    private commands: Map<string, CommandMetadata>;

    constructor(token: string, clientId: string) {
        this.rest = new REST({ version: '10' }).setToken(token);
        this.clientId = clientId;
        this.commands = new Map();
    }

    public async loadCommands(commandsPath: string): Promise<void> {
        try {
            const files = await this.getCommandFiles(commandsPath);
            const commandPromises = files.map(async (file) => {
                const { default: Command } = await import(file);
                const command = new Command();
                this.commands.set(command.data.name, command.data);
            });

            await Promise.all(commandPromises);
            logger.info(`Chargé ${this.commands.size} commandes pour le déploiement`);
        } catch (error) {
            logger.error('Erreur lors du chargement des commandes:', error);
            throw error;
        }
    }

    private async getCommandFiles(dir: string): Promise<string[]> {
        const files = await fs.readdir(dir, { withFileTypes: true });
        const commandFiles: string[] = [];

        for (const file of files) {
            const filePath = path.join(dir, file.name);
            
            if (file.isDirectory()) {
                commandFiles.push(...await this.getCommandFiles(filePath));
            } else if (file.name.endsWith('.ts')) {
                commandFiles.push(filePath);
            }
        }

        return commandFiles;
    }

    public async deployGlobally(): Promise<void> {
        try {
            logger.info('Déploiement global des commandes...');
            const commandsData = Array.from(this.commands.values());

            await this.rest.put(
                Routes.applicationCommands(this.clientId),
                { body: commandsData }
            );

            logger.info(`${commandsData.length} commandes déployées globalement avec succès`);
        } catch (error) {
            logger.error('Erreur lors du déploiement global des commandes:', error);
            throw error;
        }
    }

    public async deployToGuild(guildId: string): Promise<void> {
        try {
            logger.info(`Déploiement des commandes pour le serveur ${guildId}...`);
            const commandsData = Array.from(this.commands.values());

            await this.rest.put(
                Routes.applicationGuildCommands(this.clientId, guildId),
                { body: commandsData }
            );

            logger.info(`${commandsData.length} commandes déployées sur le serveur ${guildId}`);
        } catch (error) {
            logger.error(`Erreur lors du déploiement des commandes sur le serveur ${guildId}:`, error);
            throw error;
        }
    }

    public async deleteGlobalCommands(): Promise<void> {
        try {
            await this.rest.put(
                Routes.applicationCommands(this.clientId),
                { body: [] }
            );
            logger.info('Toutes les commandes globales ont été supprimées');
        } catch (error) {
            logger.error('Erreur lors de la suppression des commandes globales:', error);
            throw error;
        }
    }

    public async deleteGuildCommands(guildId: string): Promise<void> {
        try {
            await this.rest.put(
                Routes.applicationGuildCommands(this.clientId, guildId),
                { body: [] }
            );
            logger.info(`Toutes les commandes du serveur ${guildId} ont été supprimées`);
        } catch (error) {
            logger.error(`Erreur lors de la suppression des commandes du serveur ${guildId}:`, error);
            throw error;
        }
    }
}

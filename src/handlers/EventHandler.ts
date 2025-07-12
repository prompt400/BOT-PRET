import { Client, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { EventHandler as IEventHandler, HandlerOptions } from '../types/handlers.js';
import logger from '../utils/logger.js';

export class EventHandler implements IEventHandler {
    public readonly events: Collection<string, (...args: any[]) => Promise<void>>;
    public readonly client: Client;
    public readonly directory: string;

    constructor(options: HandlerOptions) {
        this.client = options.client;
        this.directory = options.directory;
        this.events = new Collection();
    }

    public async init(): Promise<void> {
        await this.loadEvents();
    }

    public async loadEvents(path = this.directory): Promise<void> {
        const eventFiles = this.getFiles(path);
        
        for (const file of eventFiles) {
            try {
                if (file.endsWith('.test.ts') || file.endsWith('.test.js')) continue;

                const { default: event } = await import(`file://${file}`);
                if (!event.name || !event.execute) {
                    logger.warn(`Événement invalide ignoré: ${file}`);
                    continue;
                }

                const execute = event.execute.bind(null);
                this.events.set(event.name, execute);

                if (event.once) {
                    this.client.once(event.name, execute);
                } else {
                    this.client.on(event.name, execute);
                }

                logger.info(`Événement chargé: ${event.name}`);
            } catch (error) {
                logger.error(`Erreur lors du chargement de l'événement ${file}:`, error);
            }
        }
    }

    private getFiles(path: string): string[] {
        const files: string[] = [];
        const items = readdirSync(path, { withFileTypes: true });

        for (const item of items) {
            const fullPath = join(path, item.name);
            if (item.isDirectory()) {
                files.push(...this.getFiles(fullPath));
            } else if ((item.name.endsWith('.ts') || item.name.endsWith('.js')) && 
                       !item.name.endsWith('.d.ts') && 
                       !item.name.includes('index.') &&
                       !item.name.includes('.test.')) {
                files.push(fullPath);
            }
        }

        return files;
    }
}

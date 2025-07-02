import { readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';
import type { BotClient } from '../structures/BotClient.js';
import type { Event } from '../types/Event.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export class EventManager {
  private client: BotClient;

  constructor(client: BotClient) {
    this.client = client;
  }

  public async loadEvents(): Promise<void> {
    const eventsPath = join(__dirname, '..', 'events');
    const files = (await readdir(eventsPath)).filter(
      (file) => file.endsWith('.js') || file.endsWith('.ts')
    );

    for (const file of files) {
      try {
        const filePath = join(eventsPath, file);
        const { default: event } = await import(filePath) as { default: Event };

        if (!event?.name || !event?.execute) {
          logger.warn(`Invalid event file: ${file}`);
          continue;
        }

        if (event.once) {
          this.client.once(event.name, (...args) => event.execute(this.client, ...args));
        } else {
          this.client.on(event.name, (...args) => event.execute(this.client, ...args));
        }

        logger.debug(`Loaded event: ${event.name}`);
      } catch (error) {
        logger.error(`Failed to load event ${file}:`, error);
      }
    }

    logger.info(`Loaded ${files.length} events`);
  }
}
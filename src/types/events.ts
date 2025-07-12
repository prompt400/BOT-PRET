import { Client } from 'discord.js';

export interface Event {
    name: string;
    once?: boolean;
    execute: (client: Client, ...args: any[]) => Promise<void>;
}

export interface EventMetadata {
    name: string;
    description: string;
    category: string;
    enabled: boolean;
}

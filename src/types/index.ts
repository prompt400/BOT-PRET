import { Client, Collection, ChatInputCommandInteraction } from 'discord.js';

export interface BotClient extends Client {
    commands: Collection<string, Command>;
}

export interface Command {
    data: {
        name: string;
        description: string;
        [key: string]: unknown;
    };
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface EventHandler {
    name: string;
    once?: boolean;
    execute: (...args: unknown[]) => Promise<void>;
}

import { Client, ClientEvents, Collection } from 'discord.js';
import { Command } from './commands.js';

export interface HandlerOptions {
    client: Client;
    directory: string;
}

export interface BaseHandler {
    client: Client;
    directory: string;
    init(): Promise<void>;
}

export interface EventHandler extends BaseHandler {
    events: Collection<string, (...args: any[]) => Promise<void>>;
    loadEvents(): Promise<void>;
}

export interface CommandHandler extends BaseHandler {
    commands: Collection<string, Command>;
    loadCommands(): Promise<void>;
    reloadCommand(commandName: string): Promise<void>;
}

export interface ErrorHandler extends BaseHandler {
    handleError(error: Error, context?: string): void;
    handlePromiseRejection(reason: any, promise: Promise<any>): void;
}

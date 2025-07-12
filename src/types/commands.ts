import { ChatInputCommandInteraction, SlashCommandBuilder, Client, CommandInteractionOptionResolver, AutocompleteInteraction } from 'discord.js';

export interface Command {
    meta?: {
        path: string;
        category: string;
    };
    data: SlashCommandBuilder;
    type: 'CHAT_INPUT';
    execute(context: CommandContext): Promise<void>;
    handleAutocomplete?(interaction: AutocompleteInteraction): Promise<void>;
}

export interface CommandContext {
    interaction: ChatInputCommandInteraction;
    client: Client;
    options: CommandInteractionOptionResolver;
}

export interface CommandMetadata {
    data: SlashCommandBuilder;
    category?: string;
    cooldown?: number;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export interface CommandMeta {
    name: string;
    category: string;
    path: string;
}

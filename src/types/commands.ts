import { 
    ChatInputCommandInteraction, 
    SlashCommandBuilder, 
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandsOnlyBuilder,
    Client, 
    CommandInteractionOptionResolver, 
    AutocompleteInteraction 
} from 'discord.js';

export interface Command {
    meta?: {
        path: string;
        category: string;
    };
    category?: string;
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
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

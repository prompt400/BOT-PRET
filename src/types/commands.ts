import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface Command {
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

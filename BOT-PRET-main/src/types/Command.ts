import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  PermissionsBitField,
} from 'discord.js';

export interface Command {
  data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  category: string;
  cooldown?: number;
  permissions?: bigint[];
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

export interface CommandOptions {
  name: string;
  description: string;
  category: string;
  cooldown?: number;
  permissions?: (keyof typeof PermissionsBitField.Flags)[];
}
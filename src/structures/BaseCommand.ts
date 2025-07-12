import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    AutocompleteInteraction
} from 'discord.js';
import { CommandContext } from '../types/commands.js';

export abstract class BaseCommand {
    public readonly data: SlashCommandBuilder;
    private readonly subcommands: Map<string, (context: CommandContext) => Promise<void>>;
    private readonly autocompleteHandlers: Map<string, (interaction: AutocompleteInteraction) => Promise<void>>;

    constructor() {
        this.data = new SlashCommandBuilder();
        this.subcommands = new Map();
        this.autocompleteHandlers = new Map();
        this.setup();
    }

    protected abstract setup(): void;

    protected setName(name: string): this {
        this.data.setName(name);
        return this;
    }

    protected setDescription(description: string): this {
        this.data.setDescription(description);
        return this;
    }

    protected addSubcommand(
        builder: (subcommand: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder,
        handler: (context: CommandContext) => Promise<void>
    ): this {
        const subcommand = builder(new SlashCommandSubcommandBuilder());
        this.data.addSubcommand(builder);
        this.subcommands.set(subcommand.name, handler);
        return this;
    }

    protected setAutocompleteHandler(
        optionName: string,
        handler: (interaction: AutocompleteInteraction) => Promise<void>
    ): this {
        this.autocompleteHandlers.set(optionName, handler);
        return this;
    }

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const subcommand = interaction.options.getSubcommand(false);
        const context: CommandContext = {
            interaction,
            options: interaction.options,
            client: interaction.client
        };

        try {
            if (subcommand) {
                const handler = this.subcommands.get(subcommand);
                if (handler) {
                    await handler(context);
                    return;
                }
            }

            await this.executeCommand(context);
        } catch (error) {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ Une erreur est survenue lors de l\'exécution de la commande.',
                    ephemeral: true
                });
            }
            throw error;
        }
    }

    protected abstract executeCommand(context: CommandContext): Promise<void>;

    public async handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const focusedOption = interaction.options.getFocused(true);
        const handler = this.autocompleteHandlers.get(focusedOption.name);

        if (handler) {
            await handler(interaction);
        }
    }

    protected validateOptions(context: CommandContext): boolean {
        // Les validations de base peuvent être ajoutées ici
        return true;
    }

    protected async respondWithError(
        interaction: ChatInputCommandInteraction,
        message: string,
        ephemeral: boolean = true
    ): Promise<void> {
        const response = {
            content: `❌ ${message}`,
            ephemeral
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.editReply(response);
        } else {
            await interaction.reply(response);
        }
    }

    protected async defer(
        interaction: ChatInputCommandInteraction,
        ephemeral: boolean = false
    ): Promise<void> {
        await interaction.deferReply({ ephemeral });
    }
}

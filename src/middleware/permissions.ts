import { PermissionsBitField } from 'discord.js';
import { MiddlewareContext, PermissionConfig } from '../types/middleware.js';
import logger from '../utils/logger.js';

export class PermissionsMiddleware {
    private readonly ownerIds: string[];

    constructor(ownerIds: string[]) {
        this.ownerIds = ownerIds;
    }

    public create(config: PermissionConfig) {
        return async (context: MiddlewareContext): Promise<boolean> => {
            const { interaction } = context;

            // Vérification guildOnly
            if (config.guildOnly && !interaction.guildId) {
                await interaction.reply({
                    content: '⚠️ Cette commande ne peut être utilisée que dans un serveur.',
                    ephemeral: true
                });
                return false;
            }

            // Vérification ownerOnly
            if (config.ownerOnly && !this.ownerIds.includes(interaction.user.id)) {
                await interaction.reply({
                    content: '⛔ Cette commande est réservée aux propriétaires du bot.',
                    ephemeral: true
                });
                return false;
            }

            // Vérification adminOnly
            if (config.adminOnly && !interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
                await interaction.reply({
                    content: '⛔ Cette commande nécessite les droits administrateur.',
                    ephemeral: true
                });
                return false;
            }

            // Vérification des permissions spécifiques
            if (config.requiredPermissions?.length) {
                const missingPermissions = config.requiredPermissions.filter(
                    permission => !interaction.memberPermissions?.has(permission)
                );

                if (missingPermissions.length > 0) {
                    await interaction.reply({
                        content: `⛔ Il vous manque les permissions suivantes : ${missingPermissions.join(', ')}`,
                        ephemeral: true
                    });
                    return false;
                }
            }

            logger.debug(`Permissions validées pour ${interaction.user.tag} - Commande: ${context.commandName}`);
            return true;
        };
    }
}

import { MiddlewareContext, ValidationRule } from '../types/middleware.js';
import logger from '../utils/logger.js';

export class ValidationMiddleware {
    public create(rules: ValidationRule[]): MiddlewareFunction {
        return async (context: MiddlewareContext): Promiseboolean> => {
            const { interaction } = context;
            const errors: string[] = [];

            for (const rule of rules) {
                const input = interaction.options.get(rule.field);
                const value = input && input.value;

                // Validation de présence
                if (rule.required && (value === undefined || value === null)) {
                    errors.push(`Le champ '${rule.field}' est requis.`);
                    continue;
                }

                // Validation de type
                if (rule.type && typeof value !== rule.type) {
                    errors.push(`Le champ '${rule.field}' doit être de type ${rule.type}.`);
                    continue;
                }

                // Validation des limites numériques
                if (rule.type === 'number') {
                    if (rule.min !== undefined && value < rule.min) {
                        errors.push(`Le champ '${rule.field}' doit être supérieur ou égal à ${rule.min}.`);
                    }
                    if (rule.max !== undefined && value > rule.max) {
                        errors.push(`Le champ '${rule.field}' doit être inférieur ou égal à ${rule.max}.`);
                    }
                }

                // Validation de pattern
                if (rule.pattern && !rule.pattern.test(String(value))) {
                    errors.push(`Le champ '${rule.field}' ne correspond pas au format attendu.`);
                }

                // Validation personnalisée
                if (rule.custom && !(await rule.custom(value))) {
                    errors.push(`La validation personnalisée a échoué pour le champ '${rule.field}'.`);
                }
            }

            if (errors.length > 0) {
                await interaction.reply({
                    content: `⚠️ Erreurs de validation:\n${errors.join('\n')}`,
                    ephemeral: true
                });
                return false;
            }

            logger.debug(`Validation réussie pour ${interaction.user.tag}`);
            return true;
        };
    }
}

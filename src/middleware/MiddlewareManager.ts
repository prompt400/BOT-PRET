import { PermissionsMiddleware } from './permissions.js';
import { RateLimiterMiddleware } from './rateLimiter.js';
import { ValidationMiddleware } from './validation.js';
import { MiddlewareContext, PermissionConfig, RateLimitConfig, ValidationRule } from '../types/middleware.js';
import logger from '../utils/logger.js';

export class MiddlewareManager {
    private readonly permissionsMiddleware: PermissionsMiddleware;
    private readonly rateLimiterMiddleware: RateLimiterMiddleware;
    private readonly validationMiddleware: ValidationMiddleware;

    constructor(config: {
        ownerIds: string[];
        rateLimits: RateLimitConfig;
    }) {
        this.permissionsMiddleware = new PermissionsMiddleware(config.ownerIds);
        this.rateLimiterMiddleware = new RateLimiterMiddleware(config.rateLimits);
        this.validationMiddleware = new ValidationMiddleware();
    }

    public create(config: {
        permissions?: PermissionConfig;
        validation?: ValidationRule[];
        skipRateLimit?: boolean;
    }) {
        return async (context: MiddlewareContext): Promise<boolean> => {
            try {
                // Vérification des permissions
                if (config.permissions) {
                    const permissionCheck = this.permissionsMiddleware.create(config.permissions);
                    if (!await permissionCheck(context)) {
                        return false;
                    }
                }

                // Vérification du rate limiting
                if (!config.skipRateLimit) {
                    const rateLimitCheck = this.rateLimiterMiddleware.create();
                    if (!await rateLimitCheck(context)) {
                        return false;
                    }
                }

                // Validation des inputs
                if (config.validation) {
                    const validationCheck = this.validationMiddleware.create(config.validation);
                    if (!await validationCheck(context)) {
                        return false;
                    }
                }

                return true;
            } catch (error) {
                logger.error('Erreur dans le middleware:', error);
                await context.interaction.reply({
                    content: 'Une erreur interne est survenue lors de la validation de la commande.',
                    ephemeral: true
                });
                return false;
            }
        };
    }
}

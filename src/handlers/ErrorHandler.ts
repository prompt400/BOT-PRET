import { Client } from 'discord.js';
import { ErrorHandler as IErrorHandler, HandlerOptions } from '../types/handlers.js';
import logger from '../utils/logger.js';

export class ErrorHandler implements IErrorHandler {
    public readonly client: Client;
    public readonly directory: string;

    constructor(options: HandlerOptions) {
        this.client = options.client;
        this.directory = options.directory;
    }

    public async init(): Promise<void> {
        process.on('uncaughtException', this.handleError.bind(this));
        process.on('unhandledRejection', this.handlePromiseRejection.bind(this));
        this.client.on('error', this.handleError.bind(this));
        
        logger.info('Gestionnaire d\'erreurs initialisé');
    }

    public handleError(error: Error, context = 'Global'): void {
        logger.error(`[${context}] Une erreur est survenue:`, {
            error: error.stack || error.message,
            context
        });

        // Si l'erreur est critique, on peut vouloir redémarrer le bot
        if (this.isCriticalError(error)) {
            logger.error('Erreur critique détectée, redémarrage du bot...');
            process.exit(1);
        }
    }

    public handlePromiseRejection(reason: any, promise: Promise<any>): void {
        logger.error('Une promesse a été rejetée sans être gérée:', {
            reason: reason?.stack || reason,
            promise
        });
    }

    private isCriticalError(error: Error): boolean {
        const criticalErrors = [
            'ECONNRESET',
            'ETIMEDOUT',
            'ENOTFOUND',
            'DISCORD_TOKEN_INVALID',
        ];

        return criticalErrors.some(criticalError => 
            error.message.includes(criticalError) || 
            error.name.includes(criticalError)
        );
    }
}

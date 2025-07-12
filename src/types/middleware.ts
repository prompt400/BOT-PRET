import { ChatInputCommandInteraction, PermissionResolvable } from 'discord.js';

export interface MiddlewareContext {
    interaction: ChatInputCommandInteraction;
    commandName: string;
}

export interface MiddlewareFunction {
    (context: MiddlewareContext): Promise<boolean>;
}

export interface RateLimitConfig {
    global: {
        limit: number;
        window: number;
    };
    user: {
        limit: number;
        window: number;
    };
    command: {
        limit: number;
        window: number;
    };
}

export interface PermissionConfig {
    requiredPermissions?: PermissionResolvable[];
    ownerOnly?: boolean;
    adminOnly?: boolean;
    guildOnly?: boolean;
}

export interface ValidationRule {
    field: string;
    type: 'string' | 'number' | 'boolean' | 'user' | 'channel' | 'role';
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | Promise<boolean>;
}

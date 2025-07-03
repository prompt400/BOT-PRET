import type { Command } from '../types/Command.js';
import { logger } from '../utils/logger.js';
import { ValidationError } from '../utils/errors.js';

export function validateCommand(command: Command): boolean {
  const errors: string[] = [];
  
  if (!command.data || !command.execute) {
    errors.push('missing data or execute function');
  }

  if (typeof command.execute !== 'function') {
    errors.push('execute must be a function');
  }

  if (!command.category || typeof command.category !== 'string') {
    errors.push('missing or invalid category');
  }

  if (command.cooldown !== undefined) {
    if (typeof command.cooldown !== 'number' || command.cooldown < 0 || command.cooldown > 3600) {
      errors.push('cooldown must be a number between 0 and 3600 seconds');
    }
  }

  if (command.autocomplete && typeof command.autocomplete !== 'function') {
    errors.push('autocomplete must be a function');
  }
  
  if (command.data) {
    const name = command.data.name;
    if (!name || typeof name !== 'string' || name.length < 1 || name.length > 32) {
      errors.push('command name must be between 1 and 32 characters');
    }
    
    if (!/^[\w-]+$/.test(name)) {
      errors.push('command name must only contain letters, numbers, underscores, and hyphens');
    }
  }
  
  if (errors.length > 0) {
    const commandName = command.data?.name || 'unknown';
    logger.error(`Invalid command '${commandName}': ${errors.join(', ')}`);
    return false;
  }

  return true;
}

export function validateCommandOptions(options: Record<string, unknown>): void {
  // Validate string options
  for (const [key, value] of Object.entries(options)) {
    if (value === null || value === undefined) {
      continue;
    }
    
    if (typeof value === 'string') {
      if (value.length > 6000) {
        throw new ValidationError(`Option '${key}' exceeds maximum length of 6000 characters`);
      }
      // Check for potentially harmful content
      if (value.includes('@everyone') || value.includes('@here')) {
        throw new ValidationError(`Option '${key}' contains disallowed mentions`);
      }
    }
    
    // Validate numbers
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) {
        throw new ValidationError(`Option '${key}' must be a finite number`);
      }
    }
  }
}

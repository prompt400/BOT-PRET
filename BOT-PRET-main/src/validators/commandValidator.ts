import { z } from 'zod';
import type { CommandInteraction } from 'discord.js';
import { ValidationError } from '../utils/errors.js';

export function validateCommandInput<T>(interaction: CommandInteraction, schema: z.Schema<T>): void {
  const result = schema.safeParse(interaction.options);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const errorMessages = Object.keys(errors)
      .map((field) => `${field}: ${errors[field]?.join(', ')}`)
      .join('\n');

    throw new ValidationError(`Invalid command input:\n${errorMessages}`);
  }
}

export class BotError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends BotError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class DatabaseError extends BotError {
  constructor(message: string) {
    super(message, 'DATABASE_ERROR', 500);
  }
}

export class DiscordAPIError extends BotError {
  constructor(message: string) {
    super(message, 'DISCORD_API_ERROR', 500);
  }
}

export class PermissionError extends BotError {
  constructor(message: string) {
    super(message, 'PERMISSION_ERROR', 403);
  }
}

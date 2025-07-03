import winston from 'winston';
import { config } from '../config/config.js';
import * as Sentry from '@sentry/node';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import 'winston-daily-rotate-file';

// Ensure logs directory exists
const logsDir = join(process.cwd(), 'logs');
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

const { combine, timestamp, errors, json, printf, colorize, metadata, align } = winston.format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let log = `${timestamp} [${level}]: ${message}`;
  
  // Add metadata if present
  const metaKeys = Object.keys(meta).filter(key => key !== 'service');
  if (metaKeys.length > 0) {
    const metaObj = metaKeys.reduce((acc, key) => ({ ...acc, [key]: meta[key] }), {});
    log += ` ${JSON.stringify(metaObj)}`;
  }
  
  if (stack) {
    log += `\n${stack}`;
  }
  
  return log;
});

// Custom file format
const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  errors({ stack: true }),
  metadata({ fillWith: ['service'] }),
  json()
);

// Sentry transport for error logging
interface LogInfo {
  level: string;
  message: string;
  error?: Error;
  [key: string]: unknown;
}

class SentryTransport extends winston.Transport {
  constructor(opts?: winston.transport.TransportStreamOptions) {
    super(opts);
  }

  log(info: LogInfo, callback: () => void): void {
    setImmediate(() => {
      this.emit('logged', info);
    });

    // Send errors to Sentry
    if (info.level === 'error' && config.sentry.dsn) {
      const error = info.error || new Error(info.message);
      Sentry.captureException(error, {
        level: 'error',
        extra: {
          ...info,
          timestamp: new Date().toISOString(),
        },
        tags: {
          service: 'discord-bot',
          environment: config.nodeEnv,
        },
      });
    }

    callback();
  }
}

// Create the logger instance
export const logger = winston.createLogger({
  level: config.logLevel,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  defaultMeta: { service: 'discord-bot' },
  transports: [
    // Console transport with colors
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        align(),
        consoleFormat
      ),
      handleExceptions: true,
      handleRejections: true,
    }),
    // Daily rotate file for all logs
    new winston.transports.DailyRotateFile({
      filename: join(logsDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
    }),
    // Daily rotate file for errors
    new winston.transports.DailyRotateFile({
      filename: join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: fileFormat,
    }),
    // Sentry transport for production
    ...(config.sentry.dsn && config.nodeEnv === 'production' ? [new SentryTransport({ level: 'error' })] : []),
  ],
  exitOnError: false,
});

// Performance logging utility
export function logPerformance(operation: string, startTime: number, metadata?: Record<string, any>): void {
  const duration = Date.now() - startTime;
  logger.info(`Performance: ${operation}`, {
    duration_ms: duration,
    operation,
    ...metadata,
  });
}

// API call logging utility
export function logAPICall(
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number,
  error?: Error
): void {
  const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'info';
  
  logger.log(level, `API Call: ${method} ${endpoint}`, {
    endpoint,
    method,
    statusCode,
    duration_ms: duration,
    ...(error && { error: error.message, stack: error.stack }),
  });
}

// Database query logging utility
export function logQuery(
  query: string,
  duration: number,
  rowCount?: number,
  error?: Error
): void {
  const level = error ? 'error' : duration > 1000 ? 'warn' : 'debug';
  
  logger.log(level, 'Database Query', {
    query: query.substring(0, 200), // Limit query length
    duration_ms: duration,
    rowCount,
    slow: duration > 1000,
    ...(error && { error: error.message }),
  });
}

// Command execution logging
export function logCommand(
  commandName: string,
  userId: string,
  guildId: string | null,
  success: boolean,
  duration: number,
  error?: Error
): void {
  const level = success ? 'info' : 'error';
  
  logger.log(level, `Command Execution: ${commandName}`, {
    command: commandName,
    userId,
    guildId,
    success,
    duration_ms: duration,
    ...(error && { error: error.message, stack: error.stack }),
  });
}

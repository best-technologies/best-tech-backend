import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as colors from 'colors';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(
          ({ timestamp, level, message, stack, ...meta }) => {
            // Filter out Prisma query logs and other noise
            const messageStr = String(message || '');
            if (
              messageStr &&
              (messageStr.includes('prisma:query') ||
                messageStr.includes('prisma:info') ||
                messageStr.includes('prisma:warn') ||
                messageStr.includes('prisma:error') ||
                messageStr.includes('SELECT') ||
                messageStr.includes('INSERT') ||
                messageStr.includes('UPDATE') ||
                messageStr.includes('DELETE'))
            ) {
              return ''; // Return empty string instead of null
            }

            let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
            if (
              Object.keys(meta).length > 0 &&
              meta.context !== 'Server' &&
              meta.context !== 'Database'
            ) {
              log += ` ${JSON.stringify(meta)}`;
            }
            if (stack) {
              log += `\n${stack}`;
            }
            return log;
          },
        ),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    // Skip logging for certain contexts to reduce noise
    if (context === 'Prisma' || context === 'Database') {
      return;
    }
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  // Custom method for database connection logging - using logger methods
  logDatabaseConnection(databaseUrl: string, success: boolean) {
    if (success) {
      this.log(colors.green('✅ Database connected successfully'), 'Database');
    } else {
      this.error(
        colors.red('❌ Database connection failed'),
        undefined,
        'Database',
      );
    }
  }

  // Custom method for API endpoint logging - using logger methods
  logApiRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
  ) {
    const logLevel = statusCode >= 400 ? 'warn' : 'info';
    const color = statusCode >= 400 ? colors.yellow : colors.blue;
    const emoji = statusCode >= 400 ? '⚠️' : '📡';
    const message = color(
      `${emoji} ${method} ${url} - ${statusCode} (${duration}ms)`,
    );

    if (statusCode >= 400) {
      this.warn(message, 'API');
    } else {
      this.log(message, 'API');
    }
  }

  private sanitizeDatabaseUrl(url: string): string {
    // Remove password from database URL for logging
    return url.replace(/:([^:@]+)@/, ':****@');
  }
}

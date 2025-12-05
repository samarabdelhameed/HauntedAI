/**
 * Winston Logger Service for HauntedAI
 * Managed by Kiro
 * 
 * Provides structured logging with multiple transports (console, file)
 * Includes stack traces for errors and supports multiple log levels
 */

import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as path from 'path';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    // Configure Winston logger with multiple transports
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'haunted-ai-api' },
      transports: [
        // Console transport with colorized output for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
              let log = `${timestamp} [${level}]: ${message}`;
              
              // Add stack trace for errors
              if (stack) {
                log += `\n${stack}`;
              }
              
              // Add metadata if present
              if (Object.keys(meta).length > 0) {
                log += `\n${JSON.stringify(meta, null, 2)}`;
              }
              
              return log;
            })
          ),
        }),
        
        // File transport for all logs
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'combined.log'),
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
        
        // File transport for error logs only
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'error.log'),
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
      ],
    });
  }

  /**
   * Log informational messages
   */
  log(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.info(message, { context, ...meta });
  }

  /**
   * Log error messages with stack trace
   */
  error(message: string, trace?: string, context?: string, meta?: Record<string, any>) {
    // Build metadata object
    const metadata: Record<string, any> = {};
    
    if (context !== undefined) {
      metadata.context = context;
    }
    
    if (trace) {
      metadata.stack = trace;
    }
    
    // Merge additional metadata
    if (meta) {
      Object.keys(meta).forEach(key => {
        metadata[key] = meta[key];
      });
    }
    
    this.logger.error(message, metadata);
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.warn(message, { context, ...meta });
  }

  /**
   * Log debug messages
   */
  debug(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.debug(message, { context, ...meta });
  }

  /**
   * Log verbose messages
   */
  verbose(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.verbose(message, { context, ...meta });
  }

  /**
   * Get the underlying Winston logger instance
   */
  getWinstonLogger(): winston.Logger {
    return this.logger;
  }
}

import { createLogger, format, LoggerOptions as WinstonLoggerOptions, transports } from 'winston';
import { yellow } from 'chalk';
import { LogLevel } from '@nestjs/common';
import { NestWinstonLoggerAdapter } from '@zonneplan/open-telemetry-nest';

export interface LoggerOptions {
  context?: string;
  level?: LogLevel;
}

export class LoggerFactory {
  private get _useJsonFormat() {
    return process.env['LOG_FORMAT'] === 'json';
  }

  public create(context?: string): NestWinstonLoggerAdapter;
  public create(options?: Partial<LoggerOptions>): NestWinstonLoggerAdapter;
  public create(contextOrOptions?: string | Partial<LoggerOptions>): NestWinstonLoggerAdapter {
    let options = typeof contextOrOptions === 'string'
      ? { context: contextOrOptions }
      : contextOrOptions;

    options ??= {};

    const loggerOptions: WinstonLoggerOptions = {
      defaultMeta: {
        context: options.context ?? 'unknown',
        service: process.env['DD_SERVICE'], // Service in Datadog
        env: process.env['DD_ENV'] // Environment in Datadog
      },
      level: options.level?.toString() ?? process.env['LOG_LEVEL'] ?? 'info',
      format: this._useJsonFormat
        ? format.combine(format.timestamp(), format.json())
        : format.combine(
          format.timestamp(),
          format.colorize(),
          format.printf(
            ({ level, message, timestamp, ...meta }) => {
              let context = meta['context']
                ? meta['context']
                : 'unknown';
              context = yellow(context);

              delete meta['context']; // remove context from meta dump in log

              return `${timestamp} ${level} ${context}: ${message} ${JSON.stringify(
                meta
              )}`;
            }
          )
        ),
      transports: [new transports.Console()]
    };

    return new NestWinstonLoggerAdapter(createLogger(loggerOptions));
  }
}

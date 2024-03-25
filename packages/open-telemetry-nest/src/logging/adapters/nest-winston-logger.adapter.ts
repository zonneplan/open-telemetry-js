/* eslint-disable @typescript-eslint/no-explicit-any */

import { LogLevel } from '@nestjs/common';
import { Logger } from 'winston';
import { GlobalProviders } from '@zonneplan/open-telemetry-node';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { LoggerService } from '../services/logger.service';
import { context } from '@opentelemetry/api';

/**
 * @see https://github.com/winstonjs/winston?tab=readme-ov-file#logging
 */
const NEST_LOG_LEVEL_WINSTON_SEVERITY: Record<LogLevel, number> = {
  fatal: 0,
  error: 0,
  warn: 1,
  log: 2,
  verbose: 4,
  debug: 5
};

const SEVERITY_TEXT_TO_NEST_LOG_LEVEL: Record<string, LogLevel> = {
  FATAL: 'fatal',
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'log',
  DEBUG: 'debug',
  TRACE: 'verbose',
  UNSPECIFIED: 'log'
};

export class NestWinstonLoggerAdapter extends LoggerService {
  private severityNumberToSeverityTextMap: Record<number, string> = {
    [SeverityNumber.UNSPECIFIED]: 'UNSPECIFIED',
    [SeverityNumber.TRACE]: 'TRACE',
    [SeverityNumber.DEBUG]: 'DEBUG',
    [SeverityNumber.INFO]: 'INFO',
    [SeverityNumber.WARN]: 'WARN',
    [SeverityNumber.ERROR]: 'ERROR',
    [SeverityNumber.FATAL]: 'FATAL'
  };

  // Winston uses 'log' for 'info' level
  private processLogLevel: LogLevel | undefined =
    process.env['LOG_LEVEL'] === 'info'
      ? 'log'
      : (process.env['LOG_LEVEL'] as LogLevel);

  private winstonLogLevel =
    NEST_LOG_LEVEL_WINSTON_SEVERITY[
    this.processLogLevel ?? ('log' as LogLevel)
      ];

  private instrumentationScopeName: string | undefined;

  public constructor(private readonly logger: Logger) {
    super();
  }

  public override log(message: any, ...optionalParams: any[]) {
    this.logger.info(message, ...optionalParams);
    this.emitLog(SeverityNumber.INFO, message, ...optionalParams);
  }

  public override error(message: any, ...optionalParams: any[]) {
    this.logger.error(message, ...optionalParams);
    this.emitLog(SeverityNumber.ERROR, message, ...optionalParams);
  }

  public override warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(message, ...optionalParams);
    this.emitLog(SeverityNumber.WARN, message, ...optionalParams);
  }

  public override debug(message: any, ...optionalParams: any[]) {
    this.logger.debug(message, ...optionalParams);
    this.emitLog(SeverityNumber.DEBUG, message, ...optionalParams);
  }

  public override verbose(message: any, ...optionalParams: any[]) {
    this.logger.verbose(message, ...optionalParams);
    this.emitLog(SeverityNumber.UNSPECIFIED, message, ...optionalParams);
  }

  public override fatal(message: any, ...optionalParams: any[]) {
    this.logger.log('fatal', message, ...optionalParams);
    this.emitLog(SeverityNumber.FATAL, message, ...optionalParams);
  }

  public override setContext(context: string) {
    this.instrumentationScopeName = context;
    this.logger.defaultMeta = {
      ...this.logger.defaultMeta,
      context
    };
  }

  public override isLevelEnabled(level: LogLevel): boolean {
    return NEST_LOG_LEVEL_WINSTON_SEVERITY[level] <= this.winstonLogLevel;
  }

  public override setLogLevels(_: LogLevel[]): any {
    // ignored
  }
  
  private emitLog(
    severityNumber: SeverityNumber,
    body: any,
    ...optionalParams: any[]
  ): void {
    const attributes =
      optionalParams[0] && typeof optionalParams[0] === 'object'
        ? optionalParams[0]
        : {};

    let severityText =
      this.severityNumberToSeverityTextMap[severityNumber] ??
      this.severityNumberToSeverityTextMap[SeverityNumber.UNSPECIFIED];

    if (!severityText) {
      severityText = 'UNSPECIFIED';
    }

    const nestLogLevel = SEVERITY_TEXT_TO_NEST_LOG_LEVEL[severityText];
    if (!nestLogLevel || !this.isLevelEnabled(nestLogLevel)) {
      return;
    }

    if (!GlobalProviders.logProvider) {
      console.error('OpenTelemetry log provider not initialized');
      return;
    }

    GlobalProviders.logProvider.getLogger(this.instrumentationScopeName ?? 'unknown').emit({
      severityNumber,
      body,
      severityText,
      attributes,
      context: context.active()
    });
  }
}

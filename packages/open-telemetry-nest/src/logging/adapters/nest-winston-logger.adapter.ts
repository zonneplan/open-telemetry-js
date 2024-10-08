import { LogLevel } from '@nestjs/common';
import { Logger } from 'winston';
import { GlobalProviders } from '@zonneplan/open-telemetry-node';
import { LogAttributes, SeverityNumber } from '@opentelemetry/api-logs';
import { LoggerService } from '../services/logger.service';
import { context, diag } from '@opentelemetry/api';
import {
  NEST_LOG_LEVEL_WINSTON_SEVERITY,
  SEVERITY_NUMBER_TO_TEXT_MAP,
  SEVERITY_TEXT_TO_NEST_LOG_LEVEL
} from '../constants';

type OptionalParams = [] | [string | object];

/**
 * Logger adapter for NestJS that uses Winston as the underlying logger.
 * Supports two types of log level filters via environment variables:
 *  - LOG_LEVEL -> sets the winston log level for regular logging
 *  - LOG_LEVEL_OTEL -> sets the log level for emission to OpenTelemetry
 */
export class NestWinstonLoggerAdapter extends LoggerService {
  private static winstonLogLevelNest =
    this.getCorrectedLogLevel(
      process.env['LOG_LEVEL'] ?? 'info'
    );

  private static otelLogLevelNest =
    this.getCorrectedLogLevel(
      process.env['LOG_LEVEL_OTEL'] ?? 'info'
    );

  private instrumentationScopeName: string | undefined;

  public constructor(private readonly logger: Logger) {
    super();
  }

  /**
   * Nest uses 'log' instead of 'info'
   */
  private static getCorrectedLogLevel(logLevel: string): LogLevel {
    if (logLevel === 'info') {
      return 'log';
    }

    return logLevel as LogLevel;
  }

  public override log(message: string, ...optionalParams: OptionalParams) {
    this.emitLog(SeverityNumber.INFO, message, ...optionalParams);
  }

  public override error(message: string, ...optionalParams: OptionalParams) {
    this.emitLog(SeverityNumber.ERROR, message, ...optionalParams);
  }

  public override warn(message: string, ...optionalParams: OptionalParams) {
    this.emitLog(SeverityNumber.WARN, message, ...optionalParams);
  }

  public override debug(message: string, ...optionalParams: OptionalParams) {
    this.emitLog(SeverityNumber.DEBUG, message, ...optionalParams);
  }

  public override verbose(message: string, ...optionalParams: OptionalParams) {
    this.emitLog(SeverityNumber.UNSPECIFIED, message, ...optionalParams);
  }

  public override fatal(message: string, ...optionalParams: OptionalParams) {
    this.emitLog(SeverityNumber.FATAL, message, ...optionalParams);
  }

  public override setContext(context: string) {
    this.instrumentationScopeName = context;
    this.logger.defaultMeta = {
      ...this.logger.defaultMeta,
      context
    };
  }

  public override isLevelEnabled(nestLogLevel: LogLevel, maxLogLevel: LogLevel = NestWinstonLoggerAdapter.winstonLogLevelNest): boolean {
    return NEST_LOG_LEVEL_WINSTON_SEVERITY[nestLogLevel] <= NEST_LOG_LEVEL_WINSTON_SEVERITY[maxLogLevel];
  }

  public override setLogLevels(_: LogLevel[]) {
    // ignored
  }

  private emitLog(
    severityNumber: SeverityNumber,
    body: string,
    ...optionalParams: OptionalParams
  ): void {
    const { context: contextName, attributes } = this.getContextAndAttributes(
      optionalParams
    );

    const severityText =
      SEVERITY_NUMBER_TO_TEXT_MAP[severityNumber] ??
      SEVERITY_NUMBER_TO_TEXT_MAP[SeverityNumber.UNSPECIFIED] ?? 'UNSPECIFIED';

    const nestLogLevel = SEVERITY_TEXT_TO_NEST_LOG_LEVEL[severityText];
    if (!nestLogLevel) {
      return;
    }

    if (contextName) {
      this.setContext(contextName);
    }

    this.logToWinston(nestLogLevel, body, attributes);
    this.logToOpenTelemetry(nestLogLevel, severityNumber, severityText, body, attributes);
  }

  private logToWinston(logLevel: LogLevel, body: string, attributes: LogAttributes) {
    if (!this.isLevelEnabled(logLevel, NestWinstonLoggerAdapter.winstonLogLevelNest)) {
      return;
    }

    this.logger[this.toWinstonLogLevel(logLevel)](body, attributes);
  }

  private logToOpenTelemetry(logLevel: LogLevel, severityNumber: SeverityNumber, severityText: string, body: string, attributes: LogAttributes) {
    if (!this.isLevelEnabled(logLevel, NestWinstonLoggerAdapter.otelLogLevelNest)) {
      return;
    }

    if (!GlobalProviders.logProvider) {
      diag.error('OpenTelemetry log provider not initialized');
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

  /**
   * Takes the first index to decide what the context or attributes are
   *  - if the first index is an object, it is assumed to be the attributes
   *  - if the first index is a string, it is assumed to be the context (see the NestJS implementation)
   * @note we currently only support one parameter
   * @see https://github.com/nestjs/nest/blob/master/packages/common/services/console-logger.service.ts#L295
   * @private
   */
  private getContextAndAttributes(params: OptionalParams): {
    context: string | undefined;
    attributes: LogAttributes;
  } {
    const param = params[0];
    if (!param) {
      return { context: undefined, attributes: {} };
    }

    if (typeof param === 'string') {
      return { context: param, attributes: {} };
    }

    if (typeof param === 'object') {
      return { context: undefined, attributes: param as LogAttributes };
    }

    return { context: undefined, attributes: {} };
  }

  private toWinstonLogLevel(level: LogLevel) {
    if (level === 'fatal') {
      return 'error';
    }

    if (level === 'log') {
      return 'info';
    }

    return level;
  }
}

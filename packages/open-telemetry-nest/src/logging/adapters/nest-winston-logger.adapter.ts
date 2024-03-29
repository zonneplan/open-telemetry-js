/* eslint-disable @typescript-eslint/no-explicit-any */

import { LogLevel } from '@nestjs/common';
import { Logger } from 'winston';
import { GlobalProviders } from '@zonneplan/open-telemetry-node';
import { LogAttributes, SeverityNumber } from '@opentelemetry/api-logs';
import { LoggerService } from '../services/logger.service';
import { context } from '@opentelemetry/api';
import {
  NEST_LOG_LEVEL_WINSTON_SEVERITY,
  SEVERITY_NUMBER_TO_TEXT_MAP,
  SEVERITY_TEXT_TO_NEST_LOG_LEVEL
} from '../constants';


export class NestWinstonLoggerAdapter extends LoggerService {
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
    this.emitLog(SeverityNumber.INFO, message, ...optionalParams);
  }

  public override error(message: any, ...optionalParams: any[]) {
    this.emitLog(SeverityNumber.ERROR, message, ...optionalParams);
  }

  public override warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(message, ...optionalParams);
    this.emitLog(SeverityNumber.WARN, message, ...optionalParams);
  }

  public override debug(message: any, ...optionalParams: any[]) {
    this.emitLog(SeverityNumber.DEBUG, message, ...optionalParams);
  }

  public override verbose(message: any, ...optionalParams: any[]) {
    this.logger.verbose(message, ...optionalParams);
    this.emitLog(SeverityNumber.UNSPECIFIED, message, ...optionalParams);
  }

  public override fatal(message: any, ...optionalParams: any[]) {
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
    const { context: contextName, attributes } = this.getContextAndAttributes(
      optionalParams
    );

    let severityText =
      SEVERITY_NUMBER_TO_TEXT_MAP[severityNumber] ??
      SEVERITY_NUMBER_TO_TEXT_MAP[SeverityNumber.UNSPECIFIED];

    if (!severityText) {
      severityText = 'UNSPECIFIED';
    }

    const nestLogLevel = SEVERITY_TEXT_TO_NEST_LOG_LEVEL[severityText];
    if (!nestLogLevel || !this.isLevelEnabled(nestLogLevel)) {
      return;
    }

    if (contextName) {
      this.setContext(contextName);
    }

    const winstonLogLevel = this.toWinstonLogLevel(nestLogLevel);
    this.logger[winstonLogLevel](body, attributes);

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

  /**
   * Takes the first index to decide what the context or attributes are
   *  - if the first index is an object, it is assumed to be the attributes
   *  - if the first index is a string, it is assumed to be the context (see the NestJS implementation)
   * @note we currently only support one parameter
   * @see https://github.com/nestjs/nest/blob/master/packages/common/services/console-logger.service.ts#L295
   * @private
   */
  private getContextAndAttributes(params: unknown[]): {
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

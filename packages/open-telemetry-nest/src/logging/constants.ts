import { LogLevel } from '@nestjs/common';

/**
 * @see https://github.com/winstonjs/winston?tab=readme-ov-file#logging
 */
export const NEST_LOG_LEVEL_WINSTON_SEVERITY: Record<LogLevel, number> = {
  fatal: 0,
  error: 0,
  warn: 1,
  log: 2,
  verbose: 4,
  debug: 5
};

export const SEVERITY_TEXT_TO_NEST_LOG_LEVEL: Record<string, LogLevel> = {
  FATAL: 'fatal',
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'log',
  DEBUG: 'debug',
  TRACE: 'verbose',
  UNSPECIFIED: 'log'
};

import {LoggerService as NestLoggerService} from "@nestjs/common/services/logger.service";
import {LogLevel} from "@nestjs/common";

export abstract class LoggerService implements NestLoggerService {
  abstract debug(message: any, ...optionalParams: any[]): any;

  abstract error(message: any, ...optionalParams: any[]): any;

  abstract fatal(message: any, ...optionalParams: any[]): any;

  abstract log(message: any, ...optionalParams: any[]): any;

  abstract setLogLevels(levels: LogLevel[]): any;

  abstract verbose(message: any, ...optionalParams: any[]): any;

  abstract warn(message: any, ...optionalParams: any[]): any;

  abstract setContext(context: string): void;

  abstract isLevelEnabled(level: LogLevel): boolean
}

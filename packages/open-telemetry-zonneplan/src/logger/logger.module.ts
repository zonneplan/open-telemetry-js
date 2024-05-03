import { DynamicModule, Module, Scope } from '@nestjs/common';
import { LoggerFactory } from './logger.factory';
import { LoggerService } from '@zonneplan/open-telemetry-nest';
import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface';

const moduleMetadata: ModuleMetadata = {
  providers: [
    {
      provide: LoggerService,
      scope: Scope.TRANSIENT,
      useFactory: () => new LoggerFactory().create()
    }
  ],
  exports: [LoggerService]
};

@Module(moduleMetadata)
export class LoggerModule {
  public static asGlobal(): DynamicModule {
    return {
      global: true,
      module: LoggerModule,
      ...moduleMetadata
    };
  }
}

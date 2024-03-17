import {Module, Scope} from '@nestjs/common';
import {LoggerFactory} from './logger.factory';
import {LoggerService} from "@zonneplan/open-telemetry-nest";

@Module({
  providers: [
    {
      provide: LoggerService,
      scope: Scope.TRANSIENT,
      useFactory: () => new LoggerFactory().create(),
    },
  ],
  exports: [LoggerService],
})
export class LoggerModule {
}

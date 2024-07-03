import { Injectable } from '@nestjs/common';
import { Counter, Gauge, span, spanAttribute } from '@zonneplan/open-telemetry-node';
import { InjectMetric, LoggerService } from '@zonneplan/open-telemetry-nest';
import { METRICS_APP_CONTROLLER_GET, METRICS_APP_CONTROLLER_LAST_CALLED } from '../providers/metrics.provider';

@Injectable()
export class AppService {
  public constructor(
    /**
     * Metrics can be injected using the {@link InjectMetric} decorator and providing the name of the metric.
     */
    @InjectMetric(METRICS_APP_CONTROLLER_GET)
    private readonly getCounter: Counter,
    @InjectMetric(METRICS_APP_CONTROLLER_LAST_CALLED)
    private readonly lastCalledGauge: Gauge,
    private readonly logger: LoggerService
  ) {
    logger.setContext(this.constructor.name);
  }

  /**
   * Instead of manually starting a span, you can use the {@link span} decorator to automatically start a span for the given method.
   * Alternatively, use the `startSpan` method using the disposable pattern / manually ending it.
   * The span name can be overwritten, but defaults to AppService::getData.
   *
   * @note decorators require the following config options in the `tsconfig.json`:
   *     "emitDecoratorMetadata": true,
   *     "experimentalDecorators": true
   */
  @span()
  /**
   * Span attributes can be manually set in the method, by using the `setAttributeOnActiveSpan` method.
   * However, if you only want to set some input parameters as span attributes, you can use the {@link spanAttribute} decorator.
   *
   * @note primitive values (string, numbers and booleans) don't need a function for parsing. Other's do, because they are not valid span attribute values.
   * the name is automatically inferred, but technically does not match the Open telemetry spec, so it's recommended to always provide a name.
   * @todo add a default prefix for attribute names
   */
  getData(@spanAttribute((val: Date) => val.toISOString()) date: Date, @spanAttribute() name: string): {
    message: string
  } {
    this.getCounter.add(1);
    this.lastCalledGauge.record(Date.now(), {
      attr: 'test'
    });
    this.logger.log('getData called', { name, date: date.toISOString() });

    return { message: `Hello ${name}, today is ${date.toDateString()}` };
  }
}

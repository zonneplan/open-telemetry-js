import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrometheusMetricsController } from '@zonneplan/open-telemetry-nest';
import { MetricsProvider } from '../providers/metrics.provider';
import { LoggerModule } from '@zonneplan/open-telemetry-zonneplan';

@Module({
  imports: [LoggerModule],
  /**
   * When using the OTEL collector, for instance by using the OTLPMetricExporter,
   * we don't need to provide a controller here. This is just an easy way to debug/easily view the metrics.
   * Just navigate to the /metrics endpoint to see the metrics.
   */
  controllers: [AppController, PrometheusMetricsController],
  /**
   * Metrics should be provided when using Nest in the providers array,
   * Alternatively, call the `getOrCreateMetric` in the method.
   */
  providers: [...MetricsProvider, AppService]
})
export class AppModule {
}

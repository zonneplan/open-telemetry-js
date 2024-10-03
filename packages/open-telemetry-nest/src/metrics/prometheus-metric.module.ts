import { PrometheusMetricsController } from './controllers/metrics.controller';
import { Module, OnModuleInit } from '@nestjs/common';
import { PrometheusNestExporter } from './exporters/prometheus-nest.exporter';
import { GlobalProviders } from '@zonneplan/open-telemetry-node';

/**
 * Module for providing the Prometheus metrics controller.
 */
@Module({
  controllers: [PrometheusMetricsController]
})
export class PrometheusMetricModule implements OnModuleInit {
  public onModuleInit(): void {
    const nestExporter = GlobalProviders.metricReaders?.find(
      (reader) => reader instanceof PrometheusNestExporter
    );

    if (!nestExporter) {
      throw new Error(
        'PrometheusNestExporter not found, make sure to initialize OpenTelemetry with this exporter.'
      );
    }
  }
}

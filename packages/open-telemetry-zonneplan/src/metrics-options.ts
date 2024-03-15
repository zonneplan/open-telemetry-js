import { OpenTelemetryMetricsOptionsBuilder } from '@zonneplan/open-telemetry-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';

export const DefaultMetricsOptions = new OpenTelemetryMetricsOptionsBuilder()
  .withMetricReader(
    new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
      exportIntervalMillis: 1000
    })
  )
  .build();

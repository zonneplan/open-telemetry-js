import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OpenTelemetryLoggingOptionsBuilder } from '@zonneplan/open-telemetry-node';

export const DefaultLoggingOptions = new OpenTelemetryLoggingOptionsBuilder()
  // TODO: Should be implemented in the nest package, but first needs to depend on an interface for the base logger
  // .withLogRecordExporter(new NestLoggerExporter())
  .withLogRecordExporter(new OTLPLogExporter())
  .build();

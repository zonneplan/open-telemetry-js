import { LogRecordExporter } from '@opentelemetry/sdk-logs';

export interface OpenTelemetryLoggingOptions {
  logRecordExporters: LogRecordExporter[];
}

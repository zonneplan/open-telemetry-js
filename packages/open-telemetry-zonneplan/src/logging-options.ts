import {OTLPLogExporter} from '@opentelemetry/exporter-logs-otlp-http';
import {OpenTelemetryLoggingOptionsBuilder} from '@zonneplan/open-telemetry-node';

export const DefaultLoggingOptions = new OpenTelemetryLoggingOptionsBuilder()
  // @todo: https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/winston-transport -> use OpenTelemtryTransport
  //   so that the logic in the `LoggerService` can be (partially) removed
  .withLogRecordExporter(new OTLPLogExporter())
  .build();

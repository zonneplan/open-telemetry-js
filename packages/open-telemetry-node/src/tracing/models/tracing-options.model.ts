import { Sampler, SpanExporter, SpanProcessor } from '@opentelemetry/sdk-trace';
import { Instrumentation } from '@opentelemetry/instrumentation';

export interface OpenTelemetryTracingOptions {
  sampler: Sampler;
  spanExporter: SpanExporter;
  instrumentations: Instrumentation[];
  spanProcessors: SpanProcessor[];
}

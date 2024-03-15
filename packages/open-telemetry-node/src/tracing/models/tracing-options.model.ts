import {
    Sampler,
    SpanExporter,
    SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { InstrumentationOption } from '@opentelemetry/instrumentation';

export interface OpenTelemetryTracingOptions {
    sampler: Sampler;
    spanExporter: SpanExporter;
    instrumentations: InstrumentationOption[];
    spanProcessors: SpanProcessor[];
}

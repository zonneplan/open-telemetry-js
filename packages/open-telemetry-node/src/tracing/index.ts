// Builders
export {
  type IOpenTelemetryTracingOptionsBuilder,
  OpenTelemetryTracingOptionsBuilder
} from './builders/open-telemetry-tracing-options.builder';

// Decorators
export { rootSpan } from './decorators/root-span.decorator';
export { span } from './decorators/span.decorator';
export { spanAttribute } from './decorators/span-attribute.decorator';

// Models
export type { OpenTelemetryTracingOptions } from './models/tracing-options.model';
export type { SpanOptions } from './models/span-options.model';

// Span
export {
  setAttributeOnActiveSpan,
  setAttributesOnActiveSpan
} from './span/set-attributes-on-active-span';
export { setSpanStatus, setSpanOk, setSpanError } from './span/set-span-status';
export { startActiveSpan } from './span/start-active-span';
export { startSpan } from './span/start-span';

// Tracer
export { getTracer } from './tracer/get-tracer';

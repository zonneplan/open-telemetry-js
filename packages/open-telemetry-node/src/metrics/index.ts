import { Counter, Histogram } from '@opentelemetry/api';

// Builders
export {
  type IOpenTelemetryMetricsOptionsBuilder,
  OpenTelemetryMetricsOptionsBuilder
} from './builders/open-telemetry-metrics-options.builder';

// Decorators
export { metricIncrement } from './decorators/metric-increment.decorator';

// Metrics
export { Gauge } from './metrics/gauge';
export type { Counter, Histogram };
export { getOrCreateMetric } from './metrics/get-or-create-metric';

// Models
export type { OpenTelemetryMetricsOptions } from './models/metrics-options.model';
export type {
  MetricOptions,
  MetricType,
  Metrics
} from './models/metric-options.model';

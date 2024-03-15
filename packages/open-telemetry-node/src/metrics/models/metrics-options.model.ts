import { MetricReader } from '@opentelemetry/sdk-metrics';

export interface OpenTelemetryMetricsOptions {
    collectDefaultMetrics: boolean;
    metricReaders: MetricReader[];
}

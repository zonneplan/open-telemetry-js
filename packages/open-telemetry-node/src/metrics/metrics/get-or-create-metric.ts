import { MetricOptions, MetricTypeMap } from '../models/metric-options.model';
import { GlobalProviders } from '../../globals';

/**
 * Gets a metric if exists, otherwise creates a new metric.
 * @returns The metric if exists and open telemetry is initialized, otherwise null.
 */
export const getOrCreateMetric = <
  TMetricType extends keyof MetricTypeMap,
  TMetric extends MetricTypeMap[TMetricType],
>(
  options: MetricOptions<TMetricType>
): TMetric | null => {
  if (!GlobalProviders.metricProvider) {
    console.error('OpenTelemetry metrics are not initialized');
    return null;
  }

  return GlobalProviders.metricProvider.getOrCreateMetric<
    TMetricType,
    TMetric
  >(options);
};

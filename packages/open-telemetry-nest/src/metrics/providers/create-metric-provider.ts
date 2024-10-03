import { Provider } from '@nestjs/common';
import { GlobalProviders, MetricOptions, MetricType } from '@zonneplan/open-telemetry-node';

/**
 * Get the provide (injection) token for a metric.
 * @param name
 */
export const getMetricProvideToken = (name: string): string => {
  return `ZP_OTEL_METRIC_${name}`;
};

/**
 * Creates a provided for a metric.
 * @param options options used for instantiating the metric
 */
export const createMetricProvider = <TMetricType extends MetricType>(
  options: MetricOptions<TMetricType>
): Provider => {
  return {
    provide: getMetricProvideToken(options.name),
    useFactory: () =>
      GlobalProviders.metricProvider?.getOrCreateMetric(options)
  };
};

/**
 * Creates a provider for a gauge metric.
 * @param options
 */
export const createGaugeProvider = (
  options: Omit<MetricOptions<'Gauge'>, 'type'>
) => createMetricProvider({ ...options, type: 'Gauge' });

/**
 * Creates a provider for a counter metric.
 * @param options
 */
export const createCounterProvider = (
  options: Omit<MetricOptions<'Counter'>, 'type'>
) => createMetricProvider({ ...options, type: 'Counter' });

/**
 * Creates a provider for a histogram metric.
 * @param options
 */
export const createHistogramProvider = (
  options: Omit<MetricOptions<'Histogram'>, 'type'>
) => createMetricProvider({ ...options, type: 'Histogram' });

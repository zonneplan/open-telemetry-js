import { Provider } from '@nestjs/common';
import { GlobalProviders, MetricOptions, MetricType } from '@zonneplan/open-telemetry-node';

export const getMetricProvideToken = (name: string): string => {
  return `ZP_OTEL_METRIC_${name}`;
};

export const createMetricProvider = <TMetricType extends MetricType>(
  options: MetricOptions<TMetricType>
): Provider => {
  if (!GlobalProviders.metricProvider) {
    console.error(
      'OpenTelemetry metrics are not initialized. Provider will return undefined'
    );
  }

  return {
    provide: getMetricProvideToken(options.name),
    useFactory: () =>
      GlobalProviders.metricProvider?.getOrCreateMetric(options)
  };
};

export const createGaugeProvider = (
  options: Omit<MetricOptions<'Gauge'>, 'type'>
) => createMetricProvider({ ...options, type: 'Gauge' });

export const createCounterProvider = (
  options: Omit<MetricOptions<'Counter'>, 'type'>
) => createMetricProvider({ ...options, type: 'Counter' });

export const createHistogramProvider = (
  options: Omit<MetricOptions<'Histogram'>, 'type'>
) => createMetricProvider({ ...options, type: 'Histogram' });

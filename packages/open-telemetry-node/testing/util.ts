import { Span } from '@opentelemetry/api';
import { GlobalProviders } from '../src';

export const getSpanName = (span: Span) => {
  return (span as never)['name'];
};

export const getSpanAttributes = (span: Span) => {
  return (span as never)['attributes'];
};

export const getMetrics = async () => {
  const metricReader = GlobalProviders.metricReaders?.[0];
  if (!metricReader) {
    throw new Error('No metric reader found');
  }

  const { resourceMetrics } = await metricReader.collect();

  return resourceMetrics.scopeMetrics[0]?.metrics[0];
};

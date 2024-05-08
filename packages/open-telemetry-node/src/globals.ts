import { LoggerProvider } from '@opentelemetry/sdk-logs';
import { MetricProvider } from './metrics/providers/metric.provider';
import { MetricReader } from '@opentelemetry/sdk-metrics';

export class GlobalProviders {
  public static logProvider: LoggerProvider | undefined;
  public static metricProvider: MetricProvider | undefined;
  public static metricReaders: MetricReader[] | undefined;
}

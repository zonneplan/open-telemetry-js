import { Counter, Histogram } from '@opentelemetry/api';
import { MetricOptions as OtelMetricOptions } from '@opentelemetry/api/build/src/metrics/Metric';
import { Gauge } from '../metrics/gauge';

export type MetricTypeMap = {
  Gauge: Gauge;
  Counter: Counter;
  Histogram: Histogram;
};

export type Metrics = MetricTypeMap[MetricType];
export type MetricType = keyof MetricTypeMap;

export interface MetricOptions<TMetricType extends MetricType>
  extends OtelMetricOptions {
  name: string;
  type: TMetricType;
}

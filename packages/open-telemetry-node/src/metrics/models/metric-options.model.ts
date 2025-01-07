import { Counter, Histogram, ObservableGauge } from '@opentelemetry/api';
import { MetricOptions as OtelMetricOptions } from '@opentelemetry/api';
import { Gauge } from '../metrics/gauge';

export type MetricTypeMap = {
  Gauge: Gauge;
  Counter: Counter;
  Histogram: Histogram;
  ObservableGauge: ObservableGauge;
};

export type Metrics = MetricTypeMap[MetricType];
export type MetricType = keyof MetricTypeMap;

export interface MetricOptions<TMetricType extends MetricType>
  extends OtelMetricOptions {
  name: string;
  type: TMetricType;
}

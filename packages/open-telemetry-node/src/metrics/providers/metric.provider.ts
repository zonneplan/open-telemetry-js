import { Meter, MetricOptions as OtelMetricOptions } from '@opentelemetry/api';
import { Gauge } from '../metrics/gauge';
import {
    MetricOptions,
    Metrics,
    MetricTypeMap,
} from '../models/metric-options.model';

export class MetricProvider {
    private readonly registeredMetrics: Map<string, Metrics> = new Map<
        string,
        Metrics
    >();

    public constructor(private readonly meter: Meter) {}

    public getMetric(name: string): Metrics | undefined {
        return this.registeredMetrics.get(name);
    }

    public getOrCreateMetric<
        TMetricType extends keyof MetricTypeMap,
        TMetric extends MetricTypeMap[TMetricType],
    >(options: MetricOptions<TMetricType>): TMetric {
        const { name, ...opts } = options;

        const existingMetric = this.registeredMetrics.get(name);
        if (existingMetric) {
            return existingMetric as TMetric;
        }

        let metric: TMetric;
        switch (opts.type) {
            case 'Gauge':
                metric = this.createGauge(name, opts) as TMetric;
                break;
            case 'Counter':
                metric = this.meter.createCounter(name, opts) as TMetric;
                break;
            case 'Histogram':
                metric = this.meter.createHistogram(name, opts) as TMetric;
                break;
            default:
                throw new Error(`Unknown metric type: ${opts.type}`);
        }

        this.registeredMetrics.set(name, metric);
        return metric;
    }

    private createGauge(name: string, options: OtelMetricOptions): Gauge {
        const gauge = this.meter.createObservableGauge(name, options);
        return new Gauge(gauge);
    }
}

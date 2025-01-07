import { MeterProvider, MetricReader } from '@opentelemetry/sdk-metrics';
import { Gauge } from '../metrics/gauge';
import { MetricOptions } from '../models/metric-options.model';
import { MetricProvider } from './metric.provider';
import { mock } from 'jest-mock-extended';
import { OpenTelemetryBuilder } from '../../core/builders/open-telemetry.builder';

describe('MetricProvider', () => {
  let metricProvider: MetricProvider;

  beforeAll(() => {

    new OpenTelemetryBuilder('test')
      .withMetrics(x => x.withMetricReader(mock<MetricReader>()))
      .start();
  });

  beforeEach(() => {
    const meterProvider = new MeterProvider();
    const meter = meterProvider.getMeter('test');

    metricProvider = new MetricProvider(meter);
  });

  describe('getOrCreateMetric', () => {
    it('should return a gauge when provided with gauge options', () => {
      // Arrange
      const options: MetricOptions<'Gauge'> = {
        name: 'test',
        type: 'Gauge'
      };

      // Act
      const metric = metricProvider.getOrCreateMetric(options);

      // Assert
      expect(metric).toBeInstanceOf(Gauge);
    });

    it('should return a counter when provided with counter options', () => {
      // Arrange
      const options: MetricOptions<'Counter'> = {
        name: 'test',
        type: 'Counter'
      };

      // Act
      const metric = metricProvider.getOrCreateMetric(options);

      // Assert
      expect(metric).toHaveProperty('add');
    });

    it('should return a histogram when provided with histogram options', () => {
      // Arrange
      const options: MetricOptions<'Histogram'> = {
        name: 'test',
        type: 'Histogram'
      };

      // Act
      const metric = metricProvider.getOrCreateMetric(options);

      // Assert
      expect(metric).toHaveProperty('record');
    });

    it('should throw an error when provided with unknown options', () => {
      // Arrange
      const options = {
        name: 'test',
        type: 'unknown'
      } as unknown as MetricOptions<'Gauge'>;

      // Act
      const act = () => metricProvider.getOrCreateMetric(options);

      // Assert
      expect(act).toThrowError('Unknown metric type: unknown');
    });

    it('should return the same metric when called multiple times with the same options', () => {
      // Arrange
      const options: MetricOptions<'Gauge'> = {
        name: 'test',
        type: 'Gauge'
      };

      // Act
      const metric1 = metricProvider.getOrCreateMetric(options);
      const metric2 = metricProvider.getOrCreateMetric(options);

      // Assert
      expect(metric1).toBe(metric2);
    });
  });

  it('should return an observable gauge when provided with observable gauge options', () => {
    // Arrange
    const options: MetricOptions<'ObservableGauge'> = {
      name: 'test',
      type: 'ObservableGauge'
    };

    // Act
    const metric = metricProvider.getOrCreateMetric(options);

    // Assert
    expect(metric).toHaveProperty('addCallback');
  });
});

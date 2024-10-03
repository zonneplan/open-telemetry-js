import { Gauge } from './gauge';
import { getOrCreateMetric } from './get-or-create-metric';
import { OpenTelemetryBuilder } from '../../core/builders/open-telemetry.builder';
import { ConsoleMetricExporter, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { getMetrics } from '../../../testing/util';

describe('Gauge', () => {
  const metricName = 'test_gauge';
  const currentDate = new Date('2021-01-01T00:00:00');
  let gauge: Gauge | null;

  beforeEach(() => {
    new OpenTelemetryBuilder('test')
      .withMetrics(x => x.withMetricReader(new PeriodicExportingMetricReader({
        exporter: new ConsoleMetricExporter()
      })))
      .start();

    gauge = getOrCreateMetric({
      name: metricName,
      type: 'Gauge'
    });

    jest.useFakeTimers().setSystemTime(currentDate.getTime());
  });

  describe('record', () => {
    it('should set the correct count and attributes when set is called', async () => {
      // Arrange
      const value = 5;
      const attributes = { test: 'test' };

      // Act
      gauge?.record(value, attributes);

      // Assert
      const metrics = await getMetrics();
      const metricDescriptor = metrics?.descriptor;
      expect(metricDescriptor?.name).toEqual(metricName);

      const dataPoints = metrics?.dataPoints;
      expect(dataPoints).toHaveLength(1);

      const gaugeData = dataPoints?.[0];
      expect(gaugeData?.value).toEqual(value);
      expect(gaugeData?.attributes).toEqual(attributes);
    });

    it('should set multiple data points for the same metric when set is called multiple times with different attributes', async () => {
      // Arrange
      const attributes2 = { test: 'test' };
      const attributes3 = { test: 'test2' };

      // Act
      gauge?.record(1);
      gauge?.record(2, attributes2);
      gauge?.record(3, attributes3);

      // Assert
      const metrics = await getMetrics();
      const metricDescriptor = metrics?.descriptor;
      expect(metricDescriptor?.name).toEqual(metricName);

      const dataPoints = metrics?.dataPoints;
      expect(dataPoints).toHaveLength(3);

      const [gaugeData, gaugeData2, gaugeData3] = dataPoints ?? [];
      expect(gaugeData?.value).toEqual(1);
      expect(gaugeData?.attributes).toEqual({});

      expect(gaugeData2?.value).toEqual(2);
      expect(gaugeData2?.attributes).toEqual(attributes2);

      expect(gaugeData3?.value).toEqual(3);
      expect(gaugeData3?.attributes).toEqual(attributes3);
    });
  });

  describe('setToCurrentTime', () => {
    it('should set the correct count and attributes when setToCurrentTime is called', async () => {
      // Arrange
      const attributes = { test: 'test' };

      // Act
      gauge?.setToCurrentTime(attributes);

      // Assert
      const metrics = await getMetrics();
      const metricDescriptor = metrics?.descriptor;
      expect(metricDescriptor?.name).toEqual(metricName);

      const dataPoints = metrics?.dataPoints;
      expect(dataPoints).toHaveLength(1);

      const gaugeData = dataPoints?.[0];
      expect(gaugeData?.value).toEqual(currentDate.getTime() / 1000);
      expect(gaugeData?.attributes).toEqual(attributes);
    });
  });
});

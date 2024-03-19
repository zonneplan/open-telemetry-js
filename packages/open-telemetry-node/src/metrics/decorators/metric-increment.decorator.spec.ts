import { metricIncrement } from './metric-increment.decorator';
import { OpenTelemetryBuilder } from '../../core/builders/open-telemetry.builder';
import { ConsoleMetricExporter, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { GlobalProviders } from '../../globals';
import { getMetrics } from '../../../testing/util';
import SpyInstance = jest.SpyInstance;

describe('MetricIncrement', () => {
  let consoleWarnSpy: SpyInstance;

  beforeEach(() => {
    // @todo: use mock metric readers / exporters
    new OpenTelemetryBuilder('test')
      .withMetrics(x => x.withMetricReader(new PeriodicExportingMetricReader({
        exporter: new ConsoleMetricExporter()
      })))
      .start();

    consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {
        // empty
      });
  });

  it('should work when metric is not found', async () => {
    // Arrange
    class TestClass {
      @metricIncrement('testMetric')
      testMethod() {
        return 'test';
      }
    }

    const instance = new TestClass();

    // Act
    const result = instance.testMethod();

    // Assert
    expect(result).toBe('test');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Metric with name testMetric not found. Have you initialized OpenTelemetry and registered the metric?'
    );
  });

  it('should throw when metric is found but not a counter', () => {
    // Arrange
    GlobalProviders.metricProvider?.getOrCreateMetric({
      name: 'testMetric',
      type: 'Gauge'
    });

    // Act
    const act = () => {
      // @ts-expect-error - testing invalid usage
      class _TestClass {
        @metricIncrement('testMetric')
        testMethod() {
          return 'test';
        }
      }
    };

    // Assert
    expect(act).toThrow(new Error('Metric should be a counter'));
  });

  it('should increment the metric', async () => {
    // Arrange
    const metricName = 'testMetric';
    GlobalProviders.metricProvider?.getOrCreateMetric({
      name: metricName,
      type: 'Counter'
    });

    class TestClass {
      @metricIncrement('testMetric')
      testMethod() {
        return 'test';
      }
    }

    const instance = new TestClass();

    // Act
    const result = instance.testMethod();

    // Assert
    expect(result).toBe('test');
    const metrics = await getMetrics();
    const counterData = metrics?.dataPoints[0];
    expect(counterData?.value).toEqual(1);
  });

  it('should increment the metric multiple times for each call', async () => {
    // Arrange
    const metricName = 'testMetric';
    GlobalProviders.metricProvider?.getOrCreateMetric({
      name: metricName,
      type: 'Counter'
    });

    class TestClass {
      @metricIncrement('testMetric')
      testMethod() {
        return 'test';
      }
    }

    const instance = new TestClass();

    // Act
    instance.testMethod();
    instance.testMethod();
    instance.testMethod();

    // Assert
    const metrics = await getMetrics();
    const counterData = metrics?.dataPoints[0];
    expect(counterData?.value).toEqual(3);
  });

  it('should increment the metric with a custom increment', async () => {
    // Arrange
    const metricName = 'testMetric';
    GlobalProviders.metricProvider?.getOrCreateMetric({
      name: metricName,
      type: 'Counter'
    });

    class TestClass {
      @metricIncrement('testMetric', 5)
      testMethod() {
        return 'test';
      }
    }

    const instance = new TestClass();

    // Act
    instance.testMethod();

    // Assert
    const metrics = await getMetrics();
    const counterData = metrics?.dataPoints[0];
    expect(counterData?.value).toEqual(5);
  });

  it('should increment the metric for an async method', async () => {
    // Arrange
    const metricName = 'testMetric';
    GlobalProviders.metricProvider?.getOrCreateMetric({
      name: metricName,
      type: 'Counter'
    });

    class TestClass {
      @metricIncrement('testMetric')
      async testMethod() {
        return Promise.resolve('test');
      }
    }

    const instance = new TestClass();

    // Act
    const results = await Promise.all([
      instance.testMethod(),
      instance.testMethod()
    ]);

    // Assert
    expect(results).toEqual(['test', 'test']);

    const metrics = await getMetrics();
    const counterData = metrics?.dataPoints[0];
    expect(counterData?.value).toEqual(2);
  });
});

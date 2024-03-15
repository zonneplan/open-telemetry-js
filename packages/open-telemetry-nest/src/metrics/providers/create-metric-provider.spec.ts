import { createMetricProvider } from './create-metric-provider';
import { Gauge, OpenTelemetryBuilder } from '@zonneplan/open-telemetry-node';
import { ConsoleMetricExporter, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

describe('createMetricProvider', () => {
  it('should return undefined if metricProvider is not initialized', () => {
    // Arrange
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Act
    const result = createMetricProvider({
      name: 'test',
      type: 'Gauge'
    });

    // Assert
    expect(errorSpy.mock.calls?.[0]?.[0]).toEqual(
      'OpenTelemetry metrics are not initialized. Provider will return undefined'
    );
    expect(result).toEqual({
      provide: 'ZP_OTEL_METRIC_test',
      useFactory: expect.any(Function)
    });

    if (!('useFactory' in result)) {
      throw new Error('useFactory is not defined');
    }
    expect(result.useFactory()).toBeUndefined();
  });

  it('should return a provider with the correct token and factory', () => {
    // Arrange
    new OpenTelemetryBuilder('test')
      .withMetrics(x => x.withMetricReader(new PeriodicExportingMetricReader({
        exporter: new ConsoleMetricExporter()
      })))
      .start();

    // Act
    const result = createMetricProvider({
      name: 'test',
      type: 'Gauge'
    });

    // Assert
    expect(result).toEqual({
      provide: 'ZP_OTEL_METRIC_test',
      useFactory: expect.any(Function)
    });

    if (!('useFactory' in result)) {
      throw new Error('useFactory is not defined');
    }
    expect(result.useFactory()).toBeInstanceOf(Gauge);
  });
});

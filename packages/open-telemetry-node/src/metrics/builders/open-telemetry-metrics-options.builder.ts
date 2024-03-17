import { OptionsBuilder, OptionsBuilderFn } from '../../core/models/options-builder.models';
import assert from 'assert';
import { OpenTelemetryMetricsOptions } from '../models/metrics-options.model';
import { MetricReader } from '@opentelemetry/sdk-metrics';
import { InvalidOptionsError } from '../../core/errors/invalid-options.error';

export interface IOpenTelemetryMetricsOptionsBuilder
  extends OptionsBuilder<OpenTelemetryMetricsOptions> {
  withDefaultMetrics(): this;

  withMetricReader(reader: MetricReader): this;
}

export class OpenTelemetryMetricsOptionsBuilder
  implements IOpenTelemetryMetricsOptionsBuilder,
    OptionsBuilder<OpenTelemetryMetricsOptions> {
  private options: Partial<OpenTelemetryMetricsOptions> = {
    collectDefaultMetrics: false,
    metricReaders: []
  };

  public withDefaultMetrics(): this {
    this.options.collectDefaultMetrics = true;

    return this;
  }

  public withMetricReader(
    reader: MetricReader
  ): this {
    this.options.metricReaders ??= [];
    this.options.metricReaders.push(reader);

    return this;
  }

  public $if(condition: boolean, fn: OptionsBuilderFn<this>): this {
    if (condition) {
      fn(this);
    }

    return this;
  }


  public build(): OpenTelemetryMetricsOptions {
    const options = this.options;
    this.assertIsValidConfig(options);

    this.options = options;
    return options;
  }

  private assertIsValidConfig(
    config: Partial<OpenTelemetryMetricsOptions>
  ): asserts config is OpenTelemetryMetricsOptions {
    assert.ok(
      !!config.metricReaders?.length,
      new InvalidOptionsError('At least one metric reader is required.')
    );
  }
}

import { OptionsBuilder, OptionsBuilderFn } from '../../core/models/options-builder.models';
import { OpenTelemetryLoggingOptions } from '../models/logging-options.model';
import * as assert from 'assert';
import { InvalidOptionsError } from '../../core/errors/invalid-options.error';
import { LogRecordExporter } from '@opentelemetry/sdk-logs';

export interface IOpenTelemetryLoggingOptionsBuilder
  extends OptionsBuilder<OpenTelemetryLoggingOptions> {
  /**
   * Adds a log record exporter to the options.
   * @param exporter
   */
  withLogRecordExporter(
    exporter: LogRecordExporter
  ): this;

  /** @inheritdoc */
  build(): OpenTelemetryLoggingOptions;
}

export class OpenTelemetryLoggingOptionsBuilder
  implements IOpenTelemetryLoggingOptionsBuilder,
    OptionsBuilder<OpenTelemetryLoggingOptions> {
  private options: Partial<OpenTelemetryLoggingOptions> = {
    logRecordExporters: []
  };

  /** @inheritdoc */
  public withLogRecordExporter(
    exporter: LogRecordExporter
  ): this {
    this.options.logRecordExporters ??= [];
    this.options.logRecordExporters.push(exporter);

    return this;
  }

  /** @inheritdoc */
  public $if(condition: boolean, fn: OptionsBuilderFn<this>): this {
    if (condition) {
      fn(this);
    }

    return this;
  }

  /** @inheritdoc */
  public build(): OpenTelemetryLoggingOptions {
    const options = this.options;
    this.assertIsValidConfig(options);

    this.options = options;
    return options;
  }

  private assertIsValidConfig(
    config: Partial<OpenTelemetryLoggingOptions>
  ): asserts config is OpenTelemetryLoggingOptions {
    assert.ok(
      !!config.logRecordExporters?.length,
      new InvalidOptionsError(
        'At least one log record exporter is required.'
      )
    );
  }
}

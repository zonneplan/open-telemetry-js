import { OptionsBuilder, OptionsBuilderFn } from '../../core/models/options-builder.models';
import { Sampler, SpanExporter, SpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OpenTelemetryTracingOptions } from '../models/tracing-options.model';
import * as assert from 'assert';
import { InvalidOptionsError } from '../../core/errors/invalid-options.error';
import { Instrumentation } from '@opentelemetry/instrumentation/build/src/types';

export interface IOpenTelemetryTracingOptionsBuilder
  extends OptionsBuilder<OpenTelemetryTracingOptions> {
  /**
   * Adds a sampler to the options.
   * @param sampler
   */
  withSampler(sampler: Sampler): this;

  /**
   * Adds a span exporter to the options.
   * @param exporter
   */
  withSpanExporter(
    exporter: SpanExporter
  ): this;

  /**
   * Adds instrumentation to the options.
   * @param instrumentations
   */
  withInstrumentation(
    ...instrumentations: Instrumentation[]
  ): this;

  /**
   * Adds a span processor to the options.
   * Uses a factory instead of an instance to allow for late binding of the exporter.
   * @param processorFactory
   */
  withSpanProcessor(
    processorFactory: (exporter: SpanExporter) => SpanProcessor
  ): this;

  /** @inheritdoc */
  build(): OpenTelemetryTracingOptions;
}

export class OpenTelemetryTracingOptionsBuilder
  implements IOpenTelemetryTracingOptionsBuilder,
    OptionsBuilder<OpenTelemetryTracingOptions> {
  private options: Partial<OpenTelemetryTracingOptions> = {
    sampler: undefined,
    spanExporter: undefined,
    instrumentations: [],
    spanProcessors: []
  };

  private processorFactories: ((exporter: SpanExporter) => SpanProcessor)[] =
    [];

  /** @inheritdoc */
  public withSampler(sampler: Sampler): this {
    this.options.sampler = sampler;

    return this;
  }

  /** @inheritdoc */
  public withSpanExporter(
    exporter: SpanExporter
  ): this {
    this.options.spanExporter = exporter;

    return this;
  }

  /** @inheritdoc */
  public withInstrumentation(
    ...instrumentations: Instrumentation[]
  ): this {
    this.options.instrumentations ??= [];
    this.options.instrumentations.push(...instrumentations);

    return this;
  }

  /** @inheritdoc */
  public withSpanProcessor(
    processorFactory: (exporter: SpanExporter) => SpanProcessor
  ): this {
    this.processorFactories.push(processorFactory);

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
  public build(): OpenTelemetryTracingOptions {
    const options = this.options;
    this.assertIsValidConfig(options);

    options.spanProcessors.push(
      ...this.processorFactories.map((factory) =>
        factory(options.spanExporter)
      )
    );

    this.options = options;
    return options;
  }

  private assertIsValidConfig(
    config: Partial<OpenTelemetryTracingOptions>
  ): asserts config is OpenTelemetryTracingOptions {
    assert.ok(
      config.sampler,
      new InvalidOptionsError('Sampler is required.')
    );
    assert.ok(
      config.spanExporter,
      new InvalidOptionsError('Span exporter is required.')
    );
    assert.ok(
      !!this.processorFactories?.length,
      new InvalidOptionsError('At least one span processor is required.')
    );
  }
}

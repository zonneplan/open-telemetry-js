import { OptionsBuilder } from '../../core/models/options-builder.models';
import {
    Sampler,
    SpanExporter,
    SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { OpenTelemetryTracingOptions } from '../models/tracing-options.model';
import * as assert from 'assert';
import { InvalidOptionsError } from '../../core/errors/invalid-options.error';
import { InstrumentationOption } from '@opentelemetry/instrumentation';

export interface IOpenTelemetryTracingOptionsBuilder
    extends OptionsBuilder<OpenTelemetryTracingOptions> {
    withSampler(sampler: Sampler): IOpenTelemetryTracingOptionsBuilder;

    withSpanExporter(
        exporter: SpanExporter,
    ): IOpenTelemetryTracingOptionsBuilder;

    withInstrumentation(
        ...instrumentations: InstrumentationOption[]
    ): IOpenTelemetryTracingOptionsBuilder;

    withSpanProcessor(
        processorFactory: (exporter: SpanExporter) => SpanProcessor,
    ): IOpenTelemetryTracingOptionsBuilder;

    build(): OpenTelemetryTracingOptions;
}

export class OpenTelemetryTracingOptionsBuilder
    implements
        IOpenTelemetryTracingOptionsBuilder,
        OptionsBuilder<OpenTelemetryTracingOptions>
{
    private options: Partial<OpenTelemetryTracingOptions> = {
        sampler: undefined,
        spanExporter: undefined,
        instrumentations: [],
        spanProcessors: [],
    };

    private processorFactories: ((exporter: SpanExporter) => SpanProcessor)[] =
        [];

    public withSampler(sampler: Sampler): IOpenTelemetryTracingOptionsBuilder {
        this.options.sampler = sampler;

        return this;
    }

    public withSpanExporter(
        exporter: SpanExporter,
    ): IOpenTelemetryTracingOptionsBuilder {
        this.options.spanExporter = exporter;

        return this;
    }

    public withInstrumentation(
        ...instrumentations: InstrumentationOption[]
    ): IOpenTelemetryTracingOptionsBuilder {
        this.options.instrumentations ??= [];
        this.options.instrumentations.push(...instrumentations);

        return this;
    }

    public withSpanProcessor(
        processorFactory: (exporter: SpanExporter) => SpanProcessor,
    ): IOpenTelemetryTracingOptionsBuilder {
        this.processorFactories.push(processorFactory);

        return this;
    }

    public build(): OpenTelemetryTracingOptions {
        const options = this.options;
        this.assertIsValidConfig(options);

        options.spanProcessors.push(
            ...this.processorFactories.map((factory) =>
                factory(options.spanExporter),
            ),
        );

        this.options = options;
        return options;
    }

    private assertIsValidConfig(
        config: Partial<OpenTelemetryTracingOptions>,
    ): asserts config is OpenTelemetryTracingOptions {
        assert.ok(
            config.sampler,
            new InvalidOptionsError('Sampler is required.'),
        );
        assert.ok(
            config.spanExporter,
            new InvalidOptionsError('Span exporter is required.'),
        );
        assert.ok(
            !!this.processorFactories?.length,
            new InvalidOptionsError('At least one span processor is required.'),
        );
    }
}

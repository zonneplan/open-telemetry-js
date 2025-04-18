import { OptionsBuilder, OptionsBuilderFn, OptionsBuilderOptions } from '../models/options-builder.models';
import {
  IOpenTelemetryTracingOptionsBuilder,
  OpenTelemetryTracingOptions,
  OpenTelemetryTracingOptionsBuilder
} from '../../tracing';
import { detectResourcesSync, envDetector, IResource, Resource } from '@opentelemetry/resources';
import {
  IOpenTelemetryMetricsOptionsBuilder,
  OpenTelemetryMetricsOptions,
  OpenTelemetryMetricsOptionsBuilder
} from '../../metrics';
import { collectDefaultMetrics as collectDefaultPrometheusMetrics } from 'prom-client';
import { MetricProvider } from '../../metrics/providers/metric.provider';
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import {
  IOpenTelemetryLoggingOptionsBuilder,
  OpenTelemetryLoggingOptions,
  OpenTelemetryLoggingOptionsBuilder
} from '../../logging';
import { logs } from '@opentelemetry/api-logs';
import { CompositeLogRecordExporter } from '../../logging/exporters/composite-log-record.exporter';
import { GlobalProviders } from '../../globals';
import { Entries } from '../types/entries.type';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

export interface IOpenTelemetryBuilder {
  /**
   * Enables diagnostic logging with the specified level.
   * @param level
   */
  withDiagLogging(level: DiagLogLevel): this;

  /**
   * Configures logging with the specified options.
   * @param optionsBuilderOrOptions either a builder function or the options object.
   */
  withLogging(
    optionsBuilderOrOptions: OptionsBuilderOptions<
      IOpenTelemetryLoggingOptionsBuilder,
      OpenTelemetryLoggingOptions
    >
  ): this;

  /**
   * Configures metrics with the specified options.
   * @param optionsBuilderOrOptions either a builder function or the options object.
   */
  withMetrics(
    optionsBuilderOrOptions: OptionsBuilderOptions<
      IOpenTelemetryMetricsOptionsBuilder,
      OpenTelemetryMetricsOptions
    >
  ): this;

  /**
   * Configures tracing with the specified options.
   * @param optionsBuilderOrOptions either a builder function or the options object.
   */
  withTracing(
    optionsBuilderOrOptions: OptionsBuilderOptions<
      IOpenTelemetryTracingOptionsBuilder,
      OpenTelemetryTracingOptions
    >
  ): this;

  /**
   * Starts the OpenTelemetry SDK with the configured options.
   */
  start(): void;
}

export class OpenTelemetryBuilder implements IOpenTelemetryBuilder {
  private diagLogLevel: DiagLogLevel | null = null;
  private loggingOptions?: OpenTelemetryLoggingOptions;
  private metricsOptions?: OpenTelemetryMetricsOptions;
  private tracingOptions?: OpenTelemetryTracingOptions;
  private readonly resource: IResource;

  public constructor(private readonly serviceName: string) {
    this.resource = this.getResource();
  }

  /** @inheritdoc */
  withDiagLogging(level: DiagLogLevel): this {
    this.diagLogLevel = level;
    return this;
  }

  public withLogging(
    optionsBuilder: OptionsBuilderFn<IOpenTelemetryLoggingOptionsBuilder>
  ): this;
  public withLogging(
    options: OpenTelemetryLoggingOptions
  ): this;
  /** @inheritdoc */
  public withLogging(
    optionsBuilderOrOptions: OptionsBuilderOptions<
      OpenTelemetryLoggingOptionsBuilder,
      OpenTelemetryLoggingOptions
    >
  ): this {
    const options = this.getOptions(
      OpenTelemetryLoggingOptionsBuilder,
      optionsBuilderOrOptions
    );

    this.loggingOptions = this.mergeOptions(this.loggingOptions, options);
    return this;
  }

  public withMetrics(
    optionsBuilder: OptionsBuilderFn<IOpenTelemetryMetricsOptionsBuilder>
  ): this;
  public withMetrics(
    options: OpenTelemetryMetricsOptions
  ): this;
  /** @inheritdoc */
  public withMetrics(
    optionsBuilderOrOptions: OptionsBuilderOptions<
      OpenTelemetryMetricsOptionsBuilder,
      OpenTelemetryMetricsOptions
    >
  ): this {
    const options = this.getOptions(
      OpenTelemetryMetricsOptionsBuilder,
      optionsBuilderOrOptions
    );

    this.metricsOptions = this.mergeOptions(this.metricsOptions, options);
    return this;
  }

  public withTracing(
    optionsBuilder: OptionsBuilderFn<IOpenTelemetryTracingOptionsBuilder>
  ): this;
  public withTracing(
    options: OpenTelemetryTracingOptions
  ): this;
  /** @inheritdoc */
  public withTracing(
    optionsBuilderOrOptions: OptionsBuilderOptions<
      OpenTelemetryTracingOptionsBuilder,
      OpenTelemetryTracingOptions
    >
  ): this {
    const options = this.getOptions(
      OpenTelemetryTracingOptionsBuilder,
      optionsBuilderOrOptions
    );

    this.tracingOptions = this.mergeOptions(this.tracingOptions, options);
    return this;
  }

  /** @inheritdoc */
  public start(): void {
    this.tryEnableDiagLogging();
    this.tryEnableLogging();
    this.tryEnableMetrics();
    this.tryEnableTracing();
  }

  private tryEnableDiagLogging() {
    if (!this.diagLogLevel) {
      return;
    }

    diag.setLogger(new DiagConsoleLogger(), this.diagLogLevel);
  }

  private tryEnableLogging() {
    if (!this.loggingOptions) {
      return;
    }

    GlobalProviders.logProvider = new LoggerProvider({
      resource: this.resource
    });
    logs.setGlobalLoggerProvider(GlobalProviders.logProvider);

    const compositeLogger = new CompositeLogRecordExporter(
      ...this.loggingOptions.logRecordExporters
    );

    GlobalProviders.logProvider.addLogRecordProcessor(
      new BatchLogRecordProcessor(compositeLogger)
    );

    if (this.isAtLeastDebugDiagLogLevel()) {
      console.debug('Logging enabled.');
    }
  }

  private tryEnableMetrics() {
    if (!this.metricsOptions) {
      return;
    }

    const meterProvider = new MeterProvider({
      resource: this.resource,
      readers: this.metricsOptions.metricReaders
    });
    GlobalProviders.metricReaders = [...this.metricsOptions.metricReaders];

    if (this.metricsOptions.collectDefaultMetrics) {
      collectDefaultPrometheusMetrics();
    }

    const meter = meterProvider.getMeter('@zonneplan/open-telemetry-node');
    GlobalProviders.metricProvider = new MetricProvider(meter);

    if (this.isAtLeastDebugDiagLogLevel()) {
      console.debug('Metrics enabled.');
    }
  }

  private tryEnableTracing() {
    if (!this.tracingOptions) {
      return;
    }

    const sdk = new NodeSDK({
      traceExporter: this.tracingOptions.spanExporter,
      resource: this.resource,
      sampler: this.tracingOptions.sampler,
      instrumentations: this.tracingOptions.instrumentations,
      spanProcessors: this.tracingOptions.spanProcessors
    });

    sdk.start();

    if (this.isAtLeastDebugDiagLogLevel()) {
      console.debug('Tracing enabled.');
    }
  }

  /**
   * Combines the service name with detected resources from the environment.
   */
  private getResource(): IResource {
    const baseResource = new Resource({
      [SEMRESATTRS_SERVICE_NAME]: this.serviceName
    });

    const detectedResources = detectResourcesSync({
      detectors: [envDetector]
    });

    return baseResource.merge(detectedResources);
  }

  private getOptions<
    TBuilder extends OptionsBuilder<TOptions>,
    TOptions extends object,
  >(
    builderType: new () => TBuilder,
    optionsBuilderOrOptions: OptionsBuilderOptions<TBuilder, TOptions>
  ): TOptions {
    if (typeof optionsBuilderOrOptions === 'function') {
      const builder = new builderType();
      optionsBuilderOrOptions(builder);
      return builder.build();
    }

    return optionsBuilderOrOptions;
  }

  /**
   * Merges options, if the option is of type array, the result will be the concatenation of both arrays.
   */
  private mergeOptions<
    TOptions extends object,
  >(
    options: TOptions | undefined,
    overrides: Partial<TOptions>
  ): TOptions {
    const merged = { ...options };

    for (const [key, value] of Object.entries(overrides) as Entries<TOptions>) {
      // @ts-expect-error - we know that the key is a key of TOptions
      merged[key] = Array.isArray(value) ? [...(merged[key] ?? []), ...value] : value;
    }

    return merged as TOptions;
  }

  private isAtLeastDebugDiagLogLevel(): boolean {
    return [DiagLogLevel.DEBUG, DiagLogLevel.VERBOSE, DiagLogLevel.ALL]
      .includes(this.diagLogLevel ?? DiagLogLevel.NONE);
  }
}

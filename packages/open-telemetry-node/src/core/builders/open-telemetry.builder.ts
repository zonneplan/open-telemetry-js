import { OptionsBuilderFn, OptionsBuilderOptions } from '../models/options-builder.models';
import { getOptions } from '../utils/get-options.util';
import {
  IOpenTelemetryTracingOptionsBuilder,
  OpenTelemetryTracingOptions,
  OpenTelemetryTracingOptionsBuilder
} from '../../tracing';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { detectResourcesSync, envDetector, IResource, Resource } from '@opentelemetry/resources';
import {
  IOpenTelemetryMetricsOptionsBuilder,
  OpenTelemetryMetricsOptions,
  OpenTelemetryMetricsOptionsBuilder
} from '../../metrics';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
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
import {
  SEMRESATTRS_SERVICE_NAME
} from '@opentelemetry/semantic-conventions/build/src/resource/SemanticResourceAttributes';

export interface IOpenTelemetryBuilder {
  withDebugLogging(): this;

  withLogging(
    optionsBuilderOrOptions: OptionsBuilderOptions<
      IOpenTelemetryLoggingOptionsBuilder,
      OpenTelemetryLoggingOptions
    >
  ): this;

  withMetrics(
    optionsBuilderOrOptions: OptionsBuilderOptions<
      IOpenTelemetryMetricsOptionsBuilder,
      OpenTelemetryMetricsOptions
    >
  ): this;

  withTracing(
    optionsBuilderOrOptions: OptionsBuilderOptions<
      IOpenTelemetryTracingOptionsBuilder,
      OpenTelemetryTracingOptions
    >
  ): this;

  start(): void;
}

export class OpenTelemetryBuilder implements IOpenTelemetryBuilder {
  private debugLoggingEnabled = false;
  private loggingOptions?: OpenTelemetryLoggingOptions;
  private metricsOptions?: OpenTelemetryMetricsOptions;
  private tracingOptions?: OpenTelemetryTracingOptions;
  private resource: IResource;

  public constructor(private readonly serviceName: string) {
    this.resource = this.getResource();
  }

  public withDebugLogging(): this {
    this.debugLoggingEnabled = true;

    return this;
  }

  public withLogging(
    optionsBuilder: OptionsBuilderFn<IOpenTelemetryLoggingOptionsBuilder>
  ): this;
  public withLogging(
    options: OpenTelemetryLoggingOptions
  ): this;
  public withLogging(
    optionsBuilderOrOptions: OptionsBuilderOptions<
      OpenTelemetryLoggingOptionsBuilder,
      OpenTelemetryLoggingOptions
    >
  ): this {
    const options = getOptions(
      OpenTelemetryLoggingOptionsBuilder,
      optionsBuilderOrOptions
    );

    this.loggingOptions = { ...this.loggingOptions, ...options };
    return this;
  }

  public withMetrics(
    optionsBuilder: OptionsBuilderFn<IOpenTelemetryMetricsOptionsBuilder>
  ): this;
  public withMetrics(
    options: OpenTelemetryMetricsOptions
  ): this;
  public withMetrics(
    optionsBuilderOrOptions: OptionsBuilderOptions<
      OpenTelemetryMetricsOptionsBuilder,
      OpenTelemetryMetricsOptions
    >
  ): this {
    const options = getOptions(
      OpenTelemetryMetricsOptionsBuilder,
      optionsBuilderOrOptions
    );

    this.metricsOptions = { ...this.metricsOptions, ...options };
    return this;
  }

  public withTracing(
    optionsBuilder: OptionsBuilderFn<IOpenTelemetryTracingOptionsBuilder>
  ): this;
  public withTracing(
    options: OpenTelemetryTracingOptions
  ): this;
  public withTracing(
    optionsBuilderOrOptions: OptionsBuilderOptions<
      OpenTelemetryTracingOptionsBuilder,
      OpenTelemetryTracingOptions
    >
  ): this {
    const options = getOptions(
      OpenTelemetryTracingOptionsBuilder,
      optionsBuilderOrOptions
    );

    this.tracingOptions = { ...this.tracingOptions, ...options };
    return this;
  }

  public start(): void {
    this.tryEnableDebugLogging();
    this.tryEnableLogging();
    this.tryEnableMetrics();
    this.tryEnableTracing();
  }

  private tryEnableDebugLogging() {
    if (!this.debugLoggingEnabled) {
      return;
    }

    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ALL);
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
  }

  private tryEnableTracing() {
    if (!this.tracingOptions) {
      return;
    }

    const sdk = new NodeSDK({
      traceExporter: this.tracingOptions.spanExporter,
      resource: this.resource,
      sampler: this.tracingOptions.sampler,
      instrumentations: this.tracingOptions.instrumentations
    });

    sdk.start();

    GlobalProviders.tracerProvider = new NodeTracerProvider({
      resource: this.resource
    });

    for (const processor of this.tracingOptions.spanProcessors) {
      GlobalProviders.tracerProvider.addSpanProcessor(processor);
    }

    GlobalProviders.tracerProvider.register();
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
}

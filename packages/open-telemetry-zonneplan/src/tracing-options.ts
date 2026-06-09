import { KafkaJsInstrumentation } from 'opentelemetry-instrumentation-kafkajs';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { MySQLInstrumentation } from '@opentelemetry/instrumentation-mysql';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { AlwaysOnSampler, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import {
  OpenTelemetryTracingOptions,
  OpenTelemetryTracingOptionsBuilder
} from '@zonneplan/open-telemetry-node';
import {
  createIgnoreIncomingRequestHook,
  IgnoredIncomingPath
} from './ignore-incoming-paths';

export interface CreateDefaultTracingOptions {
  /**
   * Incoming request paths to exclude from tracing, e.g. health or metrics endpoints.
   * Matching requests do not produce a server span.
   *
   * Strings are matched against the request pathname exactly; pass a `RegExp` for prefix or
   * pattern matching (e.g. `/^\/health/` to ignore `/health` and everything below it).
   *
   * @example ['/health', '/metrics', /^\/readiness/]
   */
  ignoredIncomingPaths?: IgnoredIncomingPath[];
}

/**
 * Creates the default Zonneplan tracing options, optionally excluding certain incoming
 * request paths (such as health endpoints) from tracing.
 *
 * @example
 * new OpenTelemetryBuilder('my-api')
 *   .withTracing(createDefaultTracingOptions({ ignoredIncomingPaths: ['/health'] }))
 *   .start();
 */
export function createDefaultTracingOptions(
  options: CreateDefaultTracingOptions = {}
): OpenTelemetryTracingOptions {
  const { ignoredIncomingPaths = [] } = options;

  return new OpenTelemetryTracingOptionsBuilder()
    .withInstrumentation(
      ...getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': {
          enabled: false
        },
        '@opentelemetry/instrumentation-http': {
          ignoreIncomingRequestHook:
            createIgnoreIncomingRequestHook(ignoredIncomingPaths)
        }
      }),
      new WinstonInstrumentation({
        enabled: true
      }),
      new MySQLInstrumentation({
        enabled: true
      }),
      new NestInstrumentation({
        enabled: true
      }),
      new KafkaJsInstrumentation({
        enabled: true
      })
    )
    .withSampler(new AlwaysOnSampler())
    .withSpanExporter(new OTLPTraceExporter())
    .withSpanProcessor((exporter) => new BatchSpanProcessor(exporter))
    .build();
}

/**
 * The default Zonneplan tracing options with no ignored incoming paths.
 * Use {@link createDefaultTracingOptions} to customise it.
 */
export const DefaultTracingOptions = createDefaultTracingOptions();

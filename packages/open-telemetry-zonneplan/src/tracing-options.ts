import { KafkaJsInstrumentation } from 'opentelemetry-instrumentation-kafkajs';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { MySQLInstrumentation } from '@opentelemetry/instrumentation-mysql';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { AlwaysOnSampler, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OpenTelemetryTracingOptionsBuilder } from '@zonneplan/open-telemetry-node';

export const DefaultTracingOptions = new OpenTelemetryTracingOptionsBuilder()
  .withInstrumentation(
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false
      },
      '@opentelemetry/instrumentation-ioredis': {
        enabled: false
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

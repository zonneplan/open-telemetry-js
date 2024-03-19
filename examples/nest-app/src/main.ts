/**
 * The require imports are needed because open telemetry needs to be loaded before the application gets bootstrapped.
 */
import otel = require('@zonneplan/open-telemetry-node');
import nest = require('@zonneplan/open-telemetry-nest');
import zonneplan = require('@zonneplan/open-telemetry-zonneplan');
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import * as process from 'node:process';
import { LoggerFactory } from '@zonneplan/open-telemetry-zonneplan';

new otel.OpenTelemetryBuilder('nest-example')
  .withTracing(zonneplan.DefaultTracingOptions)
  .withLogging(zonneplan.DefaultLoggingOptions)
  .withMetrics(zonneplan.DefaultMetricsOptions)
  .withMetrics((options) =>
    options.$if(process.env['NODE_ENV'] === 'development', (metricsOptions) =>
      metricsOptions.withMetricReader(new nest.PrometheusNestExporter())
    )
  )
  // .withDebugLogging()
  .start();

async function bootstrap() {
  const logger = new LoggerFactory().create('nest-app');
  const app = await NestFactory.create(AppModule, { logger });
  app.enableShutdownHooks();

  const port = process.env['PORT'] || 3000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();

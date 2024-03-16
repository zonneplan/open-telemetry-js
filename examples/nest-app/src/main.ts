/**
 * The require imports are needed because open telemetry needs to be loaded before the application gets bootstrapped.
 */
import otel = require('@zonneplan/open-telemetry-node');
import zonneplan = require('@zonneplan/open-telemetry-zonneplan');
import nest = require('@zonneplan/open-telemetry-nest');
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

new otel.OpenTelemetryBuilder('nest-example')
  .withTracing(zonneplan.DefaultTracingOptions)
  .withLogging(zonneplan.DefaultLoggingOptions)
  .withMetrics(zonneplan.DefaultMetricsOptions)
  .withMetrics(x => x.withMetricReader(new nest.PrometheusNestExporter()))
  .start();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  const port = process.env['PORT'] || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}`
  );
}

bootstrap();

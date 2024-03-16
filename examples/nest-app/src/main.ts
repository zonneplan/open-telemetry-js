/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import otel = require('@zonneplan/open-telemetry-node');
import zonneplan = require('@zonneplan/open-telemetry-zonneplan');

new otel.OpenTelemetryBuilder('nest-example')
  .withTracing(zonneplan.DefaultTracingOptions)
  .withLogging(zonneplan.DefaultLoggingOptions)
  .withMetrics(zonneplan.DefaultMetricsOptions)
  .start();

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

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

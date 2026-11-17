import { diag, DiagLogger, DiagLogLevel, logs } from '@opentelemetry/api';
import { InMemoryLogRecordExporter } from '@opentelemetry/sdk-logs';
import {
  AlwaysOnSampler,
  InMemorySpanExporter,
  NoopSpanProcessor,
} from '@opentelemetry/sdk-trace';
import { OpenTelemetryBuilder } from './open-telemetry.builder';
import { GlobalProviders } from '../../globals';

describe('OpenTelemetryBuilder with logging and tracing', () => {
  const errors: string[] = [];
  const logExporter = new InMemoryLogRecordExporter();

  beforeAll(() => {
    delete process.env['OTEL_LOGS_EXPORTER'];

    const recordingLogger: DiagLogger = {
      error: (message) => errors.push(message),
      warn: () => undefined,
      info: () => undefined,
      debug: () => undefined,
      verbose: () => undefined,
    };
    diag.setLogger(recordingLogger, DiagLogLevel.ERROR);

    new OpenTelemetryBuilder('test')
      .withLogging((options) => options.withLogRecordExporter(logExporter))
      .withTracing((options) =>
        options
          .withSampler(new AlwaysOnSampler())
          .withSpanProcessor(() => new NoopSpanProcessor())
          .withSpanExporter(new InMemorySpanExporter()),
      )
      .start();
  });

  afterAll(async () => {
    diag.disable();
    await GlobalProviders.logProvider?.shutdown();
  });

  it('should register a single global logger provider', () => {
    expect(errors.filter((message) => message.includes('duplicate registration'))).toEqual([]);
  });

  it('should route the global logs API to the configured exporters', async () => {
    logs.getLogger('test').emit({ body: 'hello' });
    await GlobalProviders.logProvider?.forceFlush();

    expect(logExporter.getFinishedLogRecords().map((record) => record.body)).toEqual(['hello']);
  });

  it('should leave OTEL_LOGS_EXPORTER unset after starting', () => {
    expect(process.env['OTEL_LOGS_EXPORTER']).toBeUndefined();
  });
});

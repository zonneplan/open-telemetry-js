// eslint-disable-next-line @typescript-eslint/no-var-requires
import { startSpan } from './start-span';
import { OpenTelemetryBuilder } from '../../core/builders/open-telemetry.builder';
import { AlwaysOnSampler, InMemorySpanExporter, NoopSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { getSpanAttributes, getSpanName } from '../../../testing/util';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Symbol.dispose ??= Symbol('Symbol.dispose');

describe('startSpan', () => {
  beforeAll(() => {
    new OpenTelemetryBuilder('test')
      .withTracing(x =>
        x.withSampler(new AlwaysOnSampler())
          .withSpanProcessor(_ => new NoopSpanProcessor())
          .withSpanExporter(new InMemorySpanExporter())
      ).start();
  });

  it('should start a span with attributes', () => {
    const span = startSpan('test', {
      test: 'test',
      test2: 'test2'
    });

    expect(span.isRecording()).toBeTruthy();
    expect(getSpanName(span)).toBe('test');
    expect(getSpanAttributes(span)).toEqual({
      test: 'test',
      test2: 'test2'
    });
    span.end();
  });

  it('should start and end a span with no attributes', () => {
    const span = startSpan('test2');
    span.end();

    expect(span.isRecording()).toBeFalsy();
    expect(getSpanName(span)).toBe('test2');
    expect(getSpanAttributes(span)).toEqual({});
  });

  it('should automatically end a span when disposed', () => {
    const span = startSpan('test2');
    span[Symbol.dispose]();

    expect(span.isRecording()).toBeFalsy();
  });

  it('should automatically end a span when out of scope', () => {
    let span: ReturnType<typeof startSpan>;
    {
      using disposableSpan = startSpan('test2');
      span = disposableSpan;

      expect(span.isRecording()).toBeTruthy();
    }

    expect(span.isRecording()).toBeFalsy();
  });
});

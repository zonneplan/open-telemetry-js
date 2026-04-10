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
      .withTracing((x) =>
        x.withSampler(new AlwaysOnSampler())
          .withSpanProcessor(() => new NoopSpanProcessor())
          .withSpanExporter(new InMemorySpanExporter())
      )
      .start();
  });

  it('should start a span with attributes', () => {
    // Act
    const span = startSpan('test', {
      test: 'test',
      test2: 'test2',
    });

    // Assert
    expect(span.isRecording()).toBeTruthy();
    expect(getSpanName(span)).toBe('test');
    expect(getSpanAttributes(span)).toEqual({
      test: 'test',
      test2: 'test2',
    });

    // Cleanup
    span.end();
  });

  it('should start and end a span with no attributes', () => {
    // Act
    const span = startSpan('test2');
    span.end();

    // Assert
    expect(span.isRecording()).toBeFalsy();
    expect(getSpanName(span)).toBe('test2');
    expect(getSpanAttributes(span)).toEqual({});
  });

  it('should automatically end a span when disposed', () => {
    // Act
    const span = startSpan('test2');
    span[Symbol.dispose]();

    // Assert
    expect(span.isRecording()).toBeFalsy();
  });

  it('should automatically end a span when out of scope', () => {
    // Arrange
    let span: ReturnType<typeof startSpan>;

    // Act
    {
      using disposableSpan = startSpan('test2');
      span = disposableSpan;

      // Assert
      expect(span.isRecording()).toBeTruthy();
    }

    // Assert
    expect(span.isRecording()).toBeFalsy();
  });
});

import { span } from './span.decorator';
import { OpenTelemetryBuilder } from '../../core/builders/open-telemetry.builder';
import { AlwaysOffSampler, InMemorySpanExporter, NoopSpanProcessor } from '@opentelemetry/sdk-trace-node';

describe('span decorator', () => {
  class TestClass {
    @span('testMethod')
    async testAsyncMethod(): Promise<string> {
      return new Promise<string>((resolve) => {
        //@todo mock time
        setTimeout(() => {
          resolve('test');
        }, 2000);
      });
    }

    @span()
    testSyncMethod(): string {
      return 'test';
    }
  }

  beforeAll(() => {
    new OpenTelemetryBuilder('test')
      .withTracing(x =>
        x.withSampler(new AlwaysOffSampler())
          .withSpanProcessor(_ => new NoopSpanProcessor())
          .withSpanExporter(new InMemorySpanExporter())
      ).start();
  });

  it('should wrap an async method with a span and yield proper output', async () => {
    const instance = new TestClass();
    const result = await instance.testAsyncMethod();

    expect(result).toBe('test');
  });

  it('should wrap a sync method with a span and yield proper output', () => {
    const instance = new TestClass();
    const result = instance.testSyncMethod();

    expect(result).toBe('test');
  });
});

import { InvalidParameterAttributeError } from '../errors/invalid-parameter-attribute.error';
import { spanAttribute } from './span-attribute.decorator';
import { span } from './span.decorator';
import { OpenTelemetryBuilder } from '../../core/builders/open-telemetry.builder';
import { AlwaysOffSampler, InMemorySpanExporter, NoopSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { getSpanAttributes } from '../../../testing/util';
import { trace } from '@opentelemetry/api';

describe('SpanAttributeDecorator', () => {
  beforeAll(() => {
    new OpenTelemetryBuilder('test')
      .withTracing(x =>
        x.withSampler(new AlwaysOffSampler())
          .withSpanProcessor(_ => new NoopSpanProcessor())
          .withSpanExporter(new InMemorySpanExporter())
      ).start();
  });

  it('should throw if parseFunction not provided when parameter is not a supported primitive', () => {
    // Assert
    expect(() => {
      // @ts-expect-error - should throw already
      class _TestClass {
        @span()
        public testMethod(@spanAttribute() _: Date) {
          // ignored
        }
      }
    }).toThrow(InvalidParameterAttributeError);
  });

  it('should correctly set primitive parameter as attribute', () => {
    // Arrange
    class TestClass {
      @span()
      public testMethod(
        @spanAttribute() _testParam: string,
        @spanAttribute() _testParam2: number
      ) {
        return trace.getActiveSpan();
      }
    }

    const testClass = new TestClass();

    // Act
    const activeSpan = testClass.testMethod('testValue', 1);

    // Assert
    expect(activeSpan).toBeDefined();
    expect(getSpanAttributes(activeSpan)).toEqual({
      ['_testParam']: 'testValue',
      ['_testParam2']: 1
    });
  });

  it('should set the name of a primitive parameter if provided', () => {
    // Arrange
    class TestClass {
      @span()
      public testMethod(@spanAttribute('testName') _testParam: string) {
        return trace.getActiveSpan();
      }
    }

    const testClass = new TestClass();

    // Act
    const activeSpan = testClass.testMethod('testValue');

    // Assert
    expect(activeSpan).toBeDefined();
    expect(getSpanAttributes(activeSpan)).toEqual({
      testName: 'testValue'
    });
  });

  it('should correctly set the attribute if a parse function is provided', () => {
    // Arrange
    class TestClass {
      @span()
      public testMethod(
        @spanAttribute((param: { obj: string }) =>
          param.obj.toUpperCase()
        )
          _testParam: {
          obj: string;
        }
      ) {
        return trace.getActiveSpan();
      }
    }

    const testClass = new TestClass();

    // Act
    const activeSpan = testClass.testMethod({ obj: 'testValue' });

    // Assert
    expect(activeSpan).toBeDefined();
    expect(getSpanAttributes(activeSpan)).toEqual({
      ['_testParam']: 'TESTVALUE'
    });
  });

  it('should correctly set the name and attribute if the name and parse function are provided', () => {
    // Arrange
    class TestClass {
      @span()
      public testMethod(
        @spanAttribute('testName', (param: { obj: string }) =>
          param.obj.toUpperCase()
        )
          _testParam: {
          obj: string;
        }
      ) {
        return trace.getActiveSpan();
      }
    }

    const testClass = new TestClass();

    // Act
    const activeSpan = testClass.testMethod({ obj: 'testValue' });

    // Assert
    expect(activeSpan).toBeDefined();
    expect(getSpanAttributes(activeSpan)).toEqual({
      testName: 'TESTVALUE'
    });
  });

  // We can not force this compile-time with TypeScript, so a runtime error should be just fine.
  // It's the responsibility of the consumer to provide the correct parseFunction.
  it('should throw on runtime when the parseFunction does not match property type', () => {
    // Arrange
    class TestClass {
      @span()
      public testMethod(
        @spanAttribute((param: { obj: string }) =>
          param.obj.toUpperCase()
        )
          _testParam: string
      ) {
        return trace.getActiveSpan();
      }
    }

    const testClass = new TestClass();

    // Act
    expect(() => {
      testClass.testMethod('testValue');
    }).toThrow(Error);
  });
});

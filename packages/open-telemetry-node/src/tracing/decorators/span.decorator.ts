import { SpanOptions } from '../models/span-options.model';
import { startActiveSpan } from '../span/start-active-span';
import { SPAN_ATTRIBUTES } from '../constants';
import { SpanAttributeParameter } from '../models/span-attribute-parameter.model';
import { getTracer } from '../tracer/get-tracer';

/**
 * Decorator to start a span around a method.
 * To avoid less clutter within methods, this decorator can be used instead of startSpan.
 * The span name will be ClassName::methodName if no name is provided.
 * @example
 * ```typescript
 *  class MyClass {
 *    @span('my-method', { myAttribute: 'myValue' })
 *    myMethod() {
 *    // do something
 *    }
 *   }
 * ```
 * @example
 * ```typescript
 *  class MyClass {
 *    @span()
 *    myMethod() {
 *      // do something
 *    }
 *   }
 * ```
 * @param options
 */
export function span(options?: SpanOptions): MethodDecorator;
/**
 * Decorator to start a span around a method.
 * To avoid less clutter within methods, this decorator can be used instead of startSpan.
 * The span name will be ClassName::methodName if no name is provided.
 * @example
 * ```typescript
 *  class MyClass {
 *    @span('my-method', { myAttribute: 'myValue' })
 *    myMethod() {
 *    // do something
 *    }
 *   }
 * ```
 * @example
 * ```typescript
 *  class MyClass {
 *    @span()
 *    myMethod() {
 *      // do something
 *    }
 *   }
 * ```
 */
export function span(name?: string, options?: SpanOptions): MethodDecorator;
export function span(
  nameOrOptions?: string | SpanOptions,
  options?: SpanOptions
): MethodDecorator {
  return (
    _target: unknown,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    const name =
      typeof nameOrOptions === 'string' ? nameOrOptions : undefined;

    if (typeof nameOrOptions === 'object') {
      options = nameOrOptions;
    }

    let spanName = name ?? String(_propertyKey);
    if (name === undefined) {
      const className = String(_target?.constructor.name);
      if (className !== '') {
        spanName = className + '::' + spanName;
      }
    }
    const originalMethod = descriptor.value;

    descriptor.value = function(...args: unknown[]) {
      if (!getTracer()) {
        // OTEL is disabled. Probably running in a test environment.
        return originalMethod.apply(this, args);
      }

      const extractableAttributes = (Reflect.getMetadata(
        SPAN_ATTRIBUTES,
        this.constructor
      ) ?? []) as SpanAttributeParameter[];

      return startActiveSpan(
        spanName,
        (span) => {
          let result: unknown;
          try {
            for (const attribute of extractableAttributes) {
              const arg = args[attribute.index];
              if (!arg) {
                continue;
              }

              span.setAttribute(
                attribute.name,
                attribute.parseFn(arg)
              );
            }

            result = originalMethod.apply(this, args);
            if (result instanceof Promise) {
              return result.finally(() => span.end());
            }

            return result;
          } finally {
            if (!(result instanceof Promise)) {
              span.end();
            }
          }
        },
        options ?? {}
      );
    };

    return descriptor;
  };
}

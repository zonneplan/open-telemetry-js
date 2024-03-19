import { SpanAttributeParameter } from '../models/span-attribute-parameter.model';
import { SPAN_ATTRIBUTES } from '../constants';
import { InvalidParameterAttributeError } from '../errors/invalid-parameter-attribute.error';
import 'reflect-metadata';

export function spanAttribute<T>(
  name?: string,
  fn?: (param: T) => string | number | boolean
): ParameterDecorator;
export function spanAttribute<T>(
  fn?: (param: T) => string | number | boolean
): ParameterDecorator;
/**
 * Automatically applies a parameter as an attribute to the active span.
 * @remarks the method must be decorated with the {@link span} decorator for this to work
 * @param nameOrFn - either provide a name (defaults to parameter name) or a function to parse the parameter
 * @param fn - the function must match the signature of the parameter, or a runtime error may occur
 * @throws InvalidParameterAttributeError if no function is provided and the parameter is not a string, number or boolean (occurs before function invocation)
 * @throws Error - if the provided function does not match the signature of the parameter (occurs when the function is invoked)
 */
export function spanAttribute<T>(
  nameOrFn?: string | ((param: T) => string | number | boolean),
  fn?: (param: T) => string | number | boolean
): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    if (!propertyKey) {
      return;
    }

    const name =
      typeof nameOrFn === 'string'
        ? nameOrFn
        : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - we can be certain that propertyKey can be indexed here
        getParameterNames(target[propertyKey])[parameterIndex];
    const parseFn = typeof nameOrFn === 'function' ? nameOrFn : fn;

    const paramTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey);
    const paramType = paramTypes[parameterIndex];

    if (
      parseFn === undefined &&
      ![String, Number, Boolean].includes(paramType)
    ) {
      throw new InvalidParameterAttributeError(
        `No function provided to convert ${paramType.name} to string, number or boolean.`
      );
    }

    const targetInRegistry: SpanAttributeParameter[] =
      Reflect.getMetadata(SPAN_ATTRIBUTES, target.constructor) ?? [];

    targetInRegistry.push(<SpanAttributeParameter>{
      name: String(name),
      index: parameterIndex,
      parseFn: parseFn ? parseFn : (param: T) => param
    });

    Reflect.defineMetadata(
      SPAN_ATTRIBUTES,
      targetInRegistry,
      target.constructor
    );
  };
}

/**
 * Somewhat of a hacky solution, but will do the trick
 * @param fn
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function getParameterNames(fn: Function): string[] {
  const stringifiedFunction = fn.toString();

  const start = stringifiedFunction.indexOf('(');
  const end = stringifiedFunction.indexOf(')');

  if (!start || !end || start >= end) {
    return [];
  }

  const params = stringifiedFunction.substring(start + 1, end);
  return params.split(',').map((p) => p.trim());
}

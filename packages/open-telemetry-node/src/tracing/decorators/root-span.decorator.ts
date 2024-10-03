import { SpanOptions } from '../models/span-options.model';
import { span } from './span.decorator';

/**
 * Decorator to start a root span (new context) around a method.
 * @param options
 */
export function rootSpan(
  options?: Exclude<SpanOptions, 'newContext'>
): MethodDecorator;
/**
 * Decorator to start a root span (new context) around a method.
 * @param name
 * @param options
 */
export function rootSpan(
  name?: string,
  options?: Exclude<SpanOptions, 'newContext'>
): MethodDecorator;
export function rootSpan(
  nameOrOptions?: string | Exclude<SpanOptions, 'newContext'>,
  options?: Exclude<SpanOptions, 'newContext'>
): MethodDecorator {
  if (typeof nameOrOptions === 'string') {
    return span(nameOrOptions, { ...options, newContext: true });
  }

  return span({ ...nameOrOptions, newContext: true });
}

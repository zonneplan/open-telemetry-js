import { Attributes, context, Span, trace } from '@opentelemetry/api';
import { getTracer } from '../tracer/get-tracer';

/**
 * Creates a span for the given name and optional attributes.
 * @example
 *  // Create a span with the name 'my-span'.
 *  using span = startSpan('my-span');
 *  return true;
 *  // Span is automatically disposed (ended).
 *  @example
 *  const span = startSpan('my-span');
 *  return true;
 *  // Span is not automatically disposed (ended).
 * @param {string} name - The name of the span.
 * @param {object} [attributes] - Optional attributes for the span.
 */
export function startSpan(
  name: string,
  attributes?: Attributes
): Span & Disposable {
  const tracer = getTracer();
  const parentContext = context.active();
  const currentSpan = tracer.startSpan(
    name,
    {
      attributes: attributes
    },
    parentContext
  ) as Span & Disposable;

  currentSpan[Symbol.dispose] = () => {
    currentSpan.end();
  };

  trace.setSpan(parentContext, currentSpan);
  return currentSpan;
}

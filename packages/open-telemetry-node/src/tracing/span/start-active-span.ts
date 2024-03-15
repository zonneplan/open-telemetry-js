import { context, ROOT_CONTEXT, Span, trace } from '@opentelemetry/api';
import { SpanOptions } from '../models/span-options.model';
import { getTracer } from '../tracer/get-tracer';

export const startActiveSpan = (
  name: string,
  fn: (parentSpan: Span) => void,
  options?: SpanOptions
) => {
  const tracer = getTracer();
  const parentContext = context.active();
  const currentSpan = tracer.startSpan(
    name,
    options,
    options?.newContext === true ? ROOT_CONTEXT : context.active()
  );

  return context.with(
    trace.setSpan(parentContext, currentSpan),
    fn,
    undefined,
    currentSpan
  );
};

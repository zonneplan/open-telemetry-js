import { SpanStatus, SpanStatusCode, trace } from '@opentelemetry/api';

/**
 * Sets status on active span
 * @param status
 */
export const setSpanStatus = (status: SpanStatus) => {
  trace.getActiveSpan()?.setStatus(status);
};

/**
 * Sets span status to OK on active span
 * @param message
 */
export const setSpanOk = (message?: SpanStatus['message']) =>
  setSpanStatus({ code: SpanStatusCode.OK, message });

/**
 * Sets span status to ERROR on active span
 * @param message
 */
export const setSpanError = (message?: SpanStatus['message']) =>
  setSpanStatus({ code: SpanStatusCode.ERROR, message });

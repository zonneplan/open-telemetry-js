import { TRACER_NAME } from '../constants';
import { trace } from '@opentelemetry/api';

/**
 * Gets the current tracer.
 */
export function getTracer() {
  return trace?.getTracer(TRACER_NAME);
}

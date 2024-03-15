import { GlobalProviders } from '../../globals';
import { TRACER_NAME } from '../constants';

/**
 * Gets the current tracer.
 */
export function getTracer() {
    return GlobalProviders.tracerProvider?.getTracer(TRACER_NAME);
}

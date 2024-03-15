import { SpanOptions as OTELSpanOptions } from '@opentelemetry/api/build/src/trace/SpanOptions';

export interface SpanOptions extends OTELSpanOptions {
    /**
     * If true, the span will be a root span, even if there is a parent span.
     * Useful for message handlers.
     */
    newContext?: boolean;
}
